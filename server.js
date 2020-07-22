const table_format = require('ascii-data-table').default;
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
// c'est infame, j'ai honte de moi
let last_scoreboard_update = undefined;

// todo use dotenv
const { token, prefix, channels, scoreboard_size, permissions } = require('./maurice_config.json');
const scoreboard_refresh_bot = require('./maurice_config.json').scoreboard_refresh;
const scoreboard_refresh_api = require('./web_api_config.json').scoreboard_refresh;
const { webUrl } = require('./web_api_config.json');

// events
const emitter = new events();
// instanciate discord.js client
client = new disc.Client();


// initialisation
db.connect(function(info) {
  console.log("[database] connected... running web-server");
  
  // start web-server
  app.listen(3000, function() {
    emitter.emit('server-running')
  });
});

// web-server running => connect discord bot
emitter.on('server-running', function() {

  console.log(`[web] running mtfka : `);
  console.log("[discord] connecting bot to discord api");
  
  // connect discord bot to discord api
  client.login(token).catch(err => console.error("error trying to connect to discord api", err));
  
  console.log("[discord] loaded " + client.commands.size + " commands");
  console.log("[timer] starting scoreboard timers");

  emitter.emit('scoreboard-update-api');
  // deux événements différents comme ça le bot discord est bien détaché du serveur
  setInterval(() => emitter.emit('scoreboard-update-api'), scoreboard_refresh_api)
  // on le fait à un intervalle différent (plus court) pour pas avoir trop d'écart au cas où le bot tenterai
  // d'update pendant que l'api met à jour le scoreboard et récupérerai un scoreboard pas encore à jour
  setTimeout(() => setInterval(() => emitter.emit('scoreboard-update-discord'), scoreboard_refresh_bot), 5000)
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
  if ( !json.slug || !json.multiplier || json.slug.constructor.name != "String" || json.multiplier.constructor.name != "Number")
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
  if ( !json.category || !json.multiplier || json.category.constructor.name != "String" || json.multiplier.constructor.name != "Number")
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

  db.getScoreboard(req.query.limit || 10)
  .then(qres => {

    if (qres) {
      if (req.query.pretty)
        res.status(200).send(prettyPrintScoreboard(qres))
      else
        res.status(200).json(qres)
    }
    else
      res.status(400).send(`category ${json.category} provided doesn't correspond to any registered challenges`)
  })
  .catch(err => console.error(err))
  .catch(err => res.status(err.httpCode).send(err.msg))

})
.get('/scoreboard_refresh', function(req, res) {

  // on utilise les events ici psq scoreboard-update utilise les event pour se trigger périodiquement
  // c'est plus simple comme ça
  const resetListeners = function(res, info) {

    emitter.removeListener('scoreboard-updated-api', success);
    emitter.removeListener('scoreboard-update-failed-api', error);
    try {
      res.status(info[0]).send(`${info[1]} ${ (info[2] && info[2].length > 0) ? `=> ${info[2]}` : ""}`);
    } catch(err) {
      // déjà répondu on s'en branle
    }
  }
  const error = (code, desc, text) => resetListeners(res, [code, desc, text])
  const success = () => {

    updateDiscordScoreboard()
    .then(resetListeners(res, [200, "OK", ""]))
    .catch(resetListeners(res, [500, "Internal Server Error", ""]))
  }

  emitter.once('scoreboard-updated-api', success)
  emitter.once('scoreboard-update-failed-api', error)
  emitter.emit('scoreboard-update-api');
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

  if (!req.body || !req.body.discord_id || !req.body.hr_username)
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

/**
 *
 *  // BYPASS CMDS
 *  // CODE & CONFIG
 *  "permissions" : {
 *   "admin" : 709091409746985002,
 *   "bypass" : ["..."]
 *  }
 *
 *  
 *  // GRP LIST, 0 <=> BYPASS
 *  // LIBERTE
 *  "permissions" : {
 *    "cmd" : [709091409746985002],
 *    "cmd2" : [709091409746985002]
 *  }
 *
**/

// load commands
client.commands = new disc.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

// bot connecté
client.on('ready', () => {
  console.log("[discord] i'm in pussies : id = " + client.user.id)

  emitter.emit('scoreboard-update-discord');
});

// reception msg discord
client.on('message', msg => {
  
  if (!msg.content.startsWith(prefix) || msg.author.bot || (msg.channel.id != channels.spambot_id && msg.channel.id != channels.scoreboard_id)) {
    msg.delete({timeout:1000})
    return;
  }

  const args = msg.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (!msg.member.roles.cache.get(permissions.admin) && !permissions.bypass.includes(command)) {
    msg.delete({timeout:1000})
    return;
  }

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

emitter.on('scoreboard-update-api', function () {

  console.log('[api][scoreboard-update] update time! but first let\'s refresh the db');
  ax.get(`http://${webUrl}/regendb`).then(res => {
    if (res.status != 500) {
      console.log('[api][scoreboard-update] updating scoreboard')
      
      db.updateScoreboard()
      .then(res => {
        console.log(`[api][scoreboard-update] scoreboard updated`)

        last_scoreboard_update = res;
        db.getScoreboard(scoreboard_size)
        .then(qres => console.log(prettyPrintScoreboard(qres)))

        // à ne catch que par l'api puisque théoriquement on doit pouvoir séparer totalement le bot et l'api
        emitter.emit('scoreboard-updated-api');

        for (let user of res)
          console.log('[api][scoreboard-update] ' + user.hr_username + ' has done new ' + user.more.unknownChallenges.length + ' unknown challenges')
      })
    } else
      throw new Error('[api][scoreboard-update] error while regenerating database. aborting scoreboard update')
  })
  .catch(err => {

    // à ne catch que par l'api puisque théoriquement on doit pouvoir séparer totalement le bot et l'api    
    if (err.response != undefined) {
      emitter.emit('scoreboard-update-failed-api', err.response.status, err.response.statusText, err.response.data);
      console.error(`[api][scoreboard-update] scoreboard update failed : ${err.response.data}`)
    }
    else {
      emitter.emit('scoreboard-update-failed-api', 500, "Internal Server Error", undefined)
      console.error(`[api][scoreboard-update] scoreboard update failed`, err);
    }
  })
})


// updates the message in scoreboard channel
emitter.on('scoreboard-update-discord', function () {

  updateDiscordScoreboard();
})

function updateDiscordScoreboard() {

    // WARNING : maybe the channel isn't cached and .get will give undefined. prefer use of fetch
  const scorechan_ugly = client.channels.cache.get(channels.scoreboard_ugly_id)
  const scorechan_pretty = client.channels.cache.get(channels.scoreboard_pretty_id)
  const spamchan = client.channels.cache.get(channels.spambot_id)

  
  if (scorechan_ugly == undefined || scorechan_ugly.type != 'text')
    return console.error(`[discord][scoreboard-update] IMPORTANT! the ugly scoreboard channel id you provided doesn't point to any TEXT based channel, please change this in maurice.json`)

  if (scorechan_pretty == undefined || scorechan_pretty.type != 'text')
    return console.error(`[discord][scoreboard-update] IMPORTANT! the pretty scoreboard channel id you provided doesn't point to any TEXT based channel, please change this in maurice.json`)

  if (spamchan == undefined || spamchan.type != 'text')
    return console.error(`[discord][scoreboard-update] IMPORTANT! the spam channel id you provided doesn't point to any TEXT based channel, please change this in maurice.json`)

  console.log(`[discord][scoreboard-update] updating scoreboard in channels ${channels.scoreboard_pretty_id} & ${channels.scoreboard_ugly_id}`)

  const getLastMessage = function(channel) {

    return channel.messages.fetchPinned()
    .then(messages => messages.find(message => !message.deleted && message.author.id == client.user.id))
  }

  const editMyMessage = function(message, pretty) {
    
    const printTypes = [uglyPrintScoreboard, markdownPrettyPrint];

    return db.getScoreboard(scoreboard_size || 10)
    .then(qres => message.edit(printTypes[pretty ? 1 : 0](qres)))
      //texte à mettre : prettyPrintScoreboard(/scoreboard)
  }

  // le code de la honte
  const sendDiscordUpdateMessages = new Promise( (res, rej) => {
    const messages_promises = [];
    if (last_scoreboard_update)
      for (let userdata of last_scoreboard_update)
        if(userdata.more) {
          for (let resolved of userdata.more.newChallenges)
            messages_promises.push(spamchan.send(`<@${userdata.discord_id}> a résolu le challenge \`${resolved.ch_slug}\``))

          userdata.more.newChallenges = []
        }
    res(messages_promises)
  })

  const updateUgly = new Promise( (res, rej) => 
    getLastMessage(scorechan_ugly)
    .then(message => {
      if (message)
        return editMyMessage(message, false).catch(err => rej(err))
      else
        return scorechan_ugly.send('placeholder for the scoreboard. should be edited soon')
               .then(message => message.pin())
               .then(message => editMyMessage(message, false))
               .then( (edited_message) => res(edited_message) )
               .catch(err => rej(err))
    }).catch(err => rej(err))
  )

  const updatePretty = new Promise( (res, rej) => 
    getLastMessage(scorechan_pretty)
      .then(message => {
        if (message)
          return editMyMessage(message, true).catch(err => rej(err))
        else
          return scorechan_pretty.send('placeholder for the scoreboard. should be edited soon')
                 .then(message => message.pin())
                 .then(message => editMyMessage(message, true))
                 .then( (edited_message) => res(edited_message) )
                 .catch(err => rej(err))
      }).catch(err => rej(err))
  );

  return Promise.allSettled([updateUgly, updatePretty, sendDiscordUpdateMessages])
}
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

function uglyPrintScoreboard(qres) {

  return '**Hacker Rank Leaderboard**\n' + qres.map( (userdata, i) => {

    let temp;
    
    // WARNING : risky, maybe (idk for what reason) the user isn't cached. will get undefined instead of it's name
    //discord_name = ((temp = client.users.cache.get(userdata.discord_id)) && temp.username) || "not cached";
    return `${qres.length - i}. <@${userdata.discord_id}>  ${userdata.score}`
  }).reverse().join("\n");
}

function prettyPrintScoreboard(qres) {

  const toFormat = [];
  let last_challenge_slug, discord_name;

  for (let userdata of qres) {

    // WARNING : risky, maybe (idk for what reason) the user isn't cached. will get undefined instead of it's name
    let temp;
    discord_name = ((temp = client.users.cache.get(userdata.discord_id)) && temp.username) || "not cached";
    last_challenge_slug = userdata.last_challenge_slug || " X "
    toFormat.unshift([discord_name, userdata.hr_username, userdata.score, last_challenge_slug])
  }
  toFormat.unshift(["discord", "hackerrank", "score", "dernier"])
  return table_format.table(toFormat).replace(/\"/g," ");
}

function markdownPrettyPrint(qres) {

      const table = prettyPrintScoreboard(qres).replace('╒', '╞').replace('╕', '╡')
      const title = '** Hacker Rank Leaderboard **'
      const top_bar = `╒${'═'.repeat(table.indexOf('\n') - 2 )}╕`;
      const first_half_spacer = ' '.repeat( Math.ceil((top_bar.length - 2 - title.length)*.5) );
      const scd_half_spacer = ' '.repeat(top_bar.length - first_half_spacer.length - 2 - title.length);
      const middle_bar = `│${first_half_spacer}${title}${scd_half_spacer}│`

      return `\`\`\`${top_bar}\n${middle_bar}\n${table}\`\`\``
}