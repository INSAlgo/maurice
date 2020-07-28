module.exports = {
  updateDiscordScoreboard : updateDiscordScoreboard
}

const { prettyPrintScoreboard, markdownPrettyPrint, uglyPrintScoreboard } = require('./modules/print_utils.js')
const bodyParser = require('body-parser');
const db = require('./modules/database.js');
const express = require('express');
const disc = require('discord.js');
const events = require('events');
const ax = require('axios');
const fs = require('fs');
require('serve-static');
const app = express();

// c'est infame, j'ai honte de moi
let last_scoreboard_update = undefined;

// todo use dotenv
const { token, prefix, channels, scoreboard_size, permissions } = require('./config/maurice_config.json');
const scoreboard_refresh_bot = require('./config/maurice_config.json').scoreboard_refresh;
const scoreboard_refresh_api = require('./config/web_api_config.json').scoreboard_refresh;
const { webUrl } = require('./config/web_api_config.json');

// events
const emitter = new events();
// WARNING : find better solution, maybe a single module to get this emitter ? 
global.emitter = emitter;

// instanciate discord.js client
client = new disc.Client();

// initialisation
console.log("[startup] trying to connect to db")
db.connect(function() {
  console.log("[database] connected... running web-server");
  
  // start web-server
  app.listen(3000, function() {
    emitter.emit('server-running')
  })
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
.use(bodyParser.json());
// load routes & print them
console.log("[startup] registered routes : ", require('./modules/routes.js').loadRoutes(app))

/* ___ ___ ___   _______  ___  ___
* |   \\ // __) / __/ _ \| _ \|   \  
* | |)|| |\__ \| (_| (_) |   /| |) | 
* |___//_\|___/ \___\___/|_|_\|___/  
*/

// load discord commands
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
  
  if (!msg.content.startsWith(prefix) || msg.author.bot || (msg.channel.id !== channels.spambot_id && msg.channel.id !== channels.scoreboard_pretty_id && msg.channel.id !== channels.scoreboard_ugly_id))
    return;

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

// when an api scoreboard update is requested
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
    if (err.response !== undefined) {
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

  
  if ((!scorechan_ugly || scorechan_ugly.type !== 'text') && (!scorechan_pretty || scorechan_pretty.type !== 'text'))
    return console.error(`[discord][scoreboard-update] IMPORTANT! none of the (pretty / ugly) scoreboard channel id point to any TEXT based channel, please change this in maurice.json`)

  if (!spamchan || spamchan.type !== 'text')
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