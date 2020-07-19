const express = require('express');
const disc = require('discord.js');
const client = new disc.Client();
const events = require('events');
const emitter = new events();
const ejs = require('ejs');
const fs = require('fs');
require('serve-static');
const app = express();

// todo use dotenv
const { prefix, token } = require('./config.json');

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
.get('/', function (req, res) {
  res.send('fuk u dummy')
})
.listen(3000, function() {

  console.log("running");
  emitter.emit('server-running')
});

// web-server running => connect discord bot
emitter.on('server-running', function() {

  console.log("[web] running mtfka");
  console.log("[discord] loaded " + client.commands.size + " commands");
  client.login(token);
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
      console.log(`${msg.author.username}[${msg.author}] invoked {${cmd.name} | ${cmd.description}}`); 
      cmd.execute(client, msg, args)
    },

    // failure
    (res) => {
      console.error(res.err);
      console.log(res.map);
    }
  );
});