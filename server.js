const hr_requests = require('./hr_requests.js')
const APIError = require('./api_error.js');
const bodyParser = require('body-parser');
const db = require('./database.js');
const express = require('express');
const disc = require('discord.js');
const events = require('events');
const ax = require('axios');
const ejs = require('ejs');
const fs = require('fs');
require('serve-static');
const app = express();

let lastRegen = 0;

// events
const emitter = new events();
// instanciate discord.js client
client = new disc.Client();

// todo use dotenv
const { webUrl, token, prefix, scoreboard_refresh } = require('./config.json');

// initialisation
db.connect(function(info) {
  console.log("[database] connected... running web-server");
  app.listen(3000, function() {
    emitter.emit('server-running')
  });
});

// web-server running => connect discord bot
emitter.on('server-running', function() {

  console.log(`[web] running mtfka : ${webUrl}`);
  console.log("[discord] connecting bot to discord api");
  client.login(token).catch(err => console.error("error trying to connect to discord api", err));
  console.log("[discord] loaded " + client.commands.size + " commands");

  console.log("[timer] starting scoreboard timer");

  emitter.emit('scoreboard-update');
  setInterval(() => emitter.emit('scoreboard-update'), scoreboard_refresh)
});
 

// setup web-server
app.set('render engine', 'ejs')
.use(express.static(__dirname + '/public'))
.use(bodyParser.urlencoded({ extended: true }))
.use(bodyParser.json())
.get('/', function (req, res) {

  res.status(200).send('fuk u dummy')
})
.post('/mult', function(req, res) {

  let json = req.body;
  if (json.slug == undefined || json.multiplier == undefined || json.slug.constructor.name != "String" || json.multiplier.constructor.name != "Number")
    res.status(400).send('wrong data provided. are you dumb, stupid or dumb ? huh?');
  
  else {

    db.applyMultiplier(json.slug, json.multiplier)
    .then(updated => {

      if (updated)
        res.sendStatus(200)
      else
        res.status(400).send(`slug ${json.slug} provided doesn't correspond to any registered challenges`)

    })
    .catch(err => res.status(err.httpCode).send(err.msg))
  }
})
.post('/multcat', function(req, res) {

  let json = req.body;
  if (json.category == undefined || json.multiplier == undefined || json.category.constructor.name != "String" || json.multiplier.constructor.name != "Number")
    res.status(400).send('wrong data provided. are you dumb, stupid or dumb ? huh?');
  
  else {

    db.applyCategoryMultiplier(json.category, json.multiplier)
    .then(updated => {

      if (updated)
        res.sendStatus(200)
      else
        res.status(400).send(`category ${json.category} provided doesn't correspond to any registered challenges`)

    })
    .catch(err => res.status(err.httpCode).send(err.msg))
  }
})
.get('/scoreboard', function(req, res) {

  db.getScoreboard(req.query.limit != undefined ? req.query.limit : 10)
  .then(qres => {
    if (qres)
      res.status(200).json(qres)
    else
      res.status(400).send(`category ${json.category} provided doesn't correspond to any registered challenges`)
  })
  .catch(err => res.status(err.httpCode).send(err.msg))

})
.get('/event', function(req, res) {

  db.specialChallenges().then( (rows) => res.status(200).json(rows) )
  .catch(err => res.status(err.httpCode).send(err.msg))
})
.get('/lowik', function (req, res) {
  res.status(200).send(`<html><head></head><body><img src="https://i.kym-cdn.com/photos/images/newsfeed/001/550/907/d41.jpg" /><audio
      autoplay src="https://www.mboxdrive.com/there-is-no-meme-take-off-your-clothes.mp3"></audio></body></html>`);
})
.get('/regendb', function (req, res) {

  // TODO : security check
  if (Math.abs(lastRegen - (lastRegen = Date.now())) > 10*1000)
    db.loadAllAlgorithms()
    .then(dat => res.status(200).json(dat))
    // un catch général, y'a beaucoup de raisons qui font que ça peut rater
    // TODO : plusieurs catch en amont qui rethrowent une APIError correcte
    .catch(err => {
      console.error("[api][regendb] error occurred while doing regendb : " + err.stack)
      res.sendStatus(500);
    })
  else
    res.status(429).send('stop spamming u dumb fuck')
})
.post('/registerhrusr', function(req, res) {

  if (req.body == undefined || req.body.discord_id === undefined || req.body.hr_username === undefined)
    res.status(400).send('wrong data provided. are you dumb, stupid or dumb ? huh?');
  else
    registerhrusr(req.body).then(result => {

      console.log(`[api] bound ${req.body.discord_id} to hr account : ${req.body.hr_username}`);
      res.sendStatus(200);

    }).catch(err => {

      if (err.constructor.name == "APIError")
        res.status(err.httpCode).send(err.msg);
      else {
        console.error(err);
        res.sendStatus(500);
      }
    })
})

/* ___ ___ ___   _______  ___  ___
* |   \\ // __) / __/ _ \| _ \|   \  
* | |)|| |\__ \| (_| (_) |   /| |) | 
* |___//_\|___/ \___\___/|_|_\|___/  
*/

// load commands
client.commands = new disc.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

// bot connecté
client.on('ready', () => console.log("[discord] i'm in pussies : id = " + client.user.id))

// reception msg discord
client.on('message', msg => {
  
  if (!msg.content.startsWith(prefix) || msg.author.bot) return;

  const args = msg.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // aucune idée de pourquoi j'ai fait un truc compliqué qui passe par des Promise alors que ça sert à rien
  // def getCmd qui va chercher la commande (command) ds les registered cmds (client.commands)
  const getCmd = async function(client, command) {
    return new Promise((resolve, reject) => {
      const cmd = client.commands.find(cmd => cmd.name === command)
      if (cmd !== undefined)
        resolve(cmd);
      else
        // reject a le droit de prendre qu'un argument askip (tout le reste donne 'undefined' qd on le passe en args) donc on passe un obj
        reject({err:`command \'${command}\' not found in `, map:client.commands});
    });
  }

  // on execute la promise crée au dessus
  getCmd(client, command).then(
    // success
    (cmd) => {
      console.log(`[discord][cmd_dispatcher] ${msg.author.username}[${msg.author}] invoked {${cmd.name} | ${cmd.description}}`); 
      cmd.execute(client, msg, args)
    },

    // failure
    (res) => {
      console.error(res.err);
      console.log(res.map);
    }
  );
});

/*
 * TIMER RELATED FUNCTIONS
 */
emitter.on('scoreboard-update', function () {

  console.log('[api][scoreboard-update] update time! but first let\'s refresh the db');
  ax.get(`http://${webUrl}/regendb`).then(res => {
    if (res.status != 500) {
      console.log('[api][scoreboard-update] updating scoreboard')
      
      db.updateScoreboard()
      .then(res => {
        console.log(`[api][scoreboard-update] scoreboard updated`, res)
      })
    } else
      throw new Error('[api][scoreboard-update] error while regenerating database. aborting scoreboard update')
  })
  .catch(err => console.error("[api][scoreboard-update] scoreboard update failed ", err))
})


/*
* WEB REQUEST RELATED FUNCTIONS 
*/


// enregistre un utilisateur grâce à un body : {body.discord_id, body.hr_username}
async function registerhrusr(body) {
  
  // ajouter check base de donnée
  return db.isUserRegistered(body.discord_id, body.hr_username).then(in_use => {

    if (in_use.discord_id) {
      console.error(`[api] [check] user id ${body.discord_id} is already used`);
      throw new APIError(400, "Provided Discord ID is already used by another HackerRank account")
    }
    else if (in_use.hr_username) {
      console.log(`[api] [check] hr username ${body.hr_username} is already used`);
      throw new APIError(400, "Provided HackerRank account is already used by another Discord ID")
    }
    else
      return ax.get(hr_requests.getUser(body.hr_username), hr_requests.default_options)  // hackerrank account exists?
          .catch(err => {
              if (err.response.status == 404) {
                throw new APIError(400, "HackerRank account doesn't exist");
              } else
                console.error(err.stack);
            })
          .then(() => db.insertUser(body.discord_id, body.hr_username))
  });
}