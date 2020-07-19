module.exports = {
  name: 'shutup',
  description: "Removes the mentioned user's messages!",
  execute(client, msg, args) {
    msg.channel.send("pong fuka");
  }
};

module.exports.execute = function (client, msg, args) {

    const mentions = msg.mentions.members;

    if (args.includes("bot"))
      mentions.set(client.user.id, {user:{username:'bot'}});

    for (let member of mentions) {

      console.log("trying to remove " + member[1].user.username + `${member[0]} msgs`);

      let name = member[1].user.username;
      msg.channel.send('ok ' + (name.toLowerCase() === "bot" ? "i" : ` <@${member[0]}> you`) + ' shut up now').then(
  
      // 100 is max limit
      msg.channel.messages.fetch({limit:100}).then(async messages => {
  
        return {messages : messages, promise : (clientId, channel, messages) => {
  
          console.log("used id = " + clientId);
  
          var count = 0;
          for (let msg of messages) {
            for (let a of msg)
              if (a.author != undefined && a.author.id == clientId) {
                try {
                  channel.messages.delete(a);
                  count++;
                } catch(err) {
                  console.err("couldn't delete msg " + a.id);
                }
              }
          }
  
          return count;
        }}
        

      }).then( res => res.promise( (name === "bot") ? client.user.id : (!msg.mentions.everyone && msg.mentions.members.size > 0 ? member[0] : -1), msg.channel, res.messages))
      .then( count => {

          console.log("deleted " + count + " from " + name);
      })
      .catch((err) => console.log(err)));
    }
  }
