module.exports = {
	name: 'ping',
	description: 'vérifie que le bot fonctionne',
	usage: 'ping',
	execute(client, msg, args) {
		msg.channel.send("pong :sylvain:");
	}
};