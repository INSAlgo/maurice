const hr_requests = require('./hr_requests.js')
const bodyParser = require('body-parser');
const express = require('express');
const disc = require('discord.js');
const events = require('events');
const ax = require('axios');
const ejs = require('ejs');
const fs = require('fs');
require('serve-static');
const app = express();
const db = require('./database.js');
const APIError = require('./api_error.js');

// obj
const emitter = new events();
const client = new disc.Client();

// todo use dotenv
const { webUrl, token, prefix } = require('./config.json');

//db
db.connect();

// load commands
client.commands = new disc.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

// setup web-server
app.set('render engine', 'ejs')
.use(express.static(__dirname + '/public'))
.use(bodyParser.urlencoded({ extended: true }))
.use(bodyParser.json())
.get('/', function (req, res) {

  res.send('fuk u dummy')
  res.sendStatus(200);
})
.post('/registerhrusr', function(req, res) {

  if (req.body == undefined || req.body.discord_id === undefined || req.body.hr_username === undefined)
    res.status(400).send('wrong data provided');
  else
    registerhrusr(req.body).then(result => {


      console.log(`[api] bound ${req.body.discord_id} to hr account : ${req.body.hr_username}`);
      res.status(200).send('ok');

    }).catch(err => {

      if (err.constructor.name == "APIError")
        res.status(err.httpCode).send(err.msg);
      else {
        console.error(err);
        res.sendStatus(500);
      }
    })
})
.listen(3000, function() {

  console.log("running");
  emitter.emit('server-running')
});

// web-server running => connect discord bot
emitter.on('server-running', function() {

  console.log(`[web] running mtfka : ${webUrl}`);
  console.log("[discord] loaded " + client.commands.size + " commands");
  client.login(token).catch(err => console.error("error trying to connect to discord api", err));
});

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