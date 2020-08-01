let { webUrl } = require('../config/maurice_config.json')
let axios = require('axios')

module.exports = {
	name: 'register',
	description: 'Register a HackerRank user ',
	execute(client, msg, args) {
		
		if (msg.mentions.members.size > 1 || args.length > 2) {
			msg.reply('Mauvais nombre d\'arguments donnés. Essaye : `!register <@Utilisateur> <username HackerRank>')
			return;
		}

		console.log(`[discord][register] trying to link HR account ${args[1]} to discord user ${args[0]}`)
		
		for (member of msg.mentions.members) {
			axios.post(`http://${webUrl}/registerhrusr`, 
				{
					discord_id : member[0],
					hr_username : args[args.length - 1]
				})
			.then(resp => console.log("[discord][register] sent register request"))
			.catch(err => {

				if (!err.reponse)
					console.error(`[discord][register] ${err.response.status} ${err.response.statusText} : ${err.response.data}`)
				else if (err.errono && err.code && err.address && err.port)
					console.error(`[discord][register] error ${err.errorno} on ${err.syscall} to ${err.address}:${err.port}`)
				else
					console.error(`[discord][register] unexpected error occurred`, err.stack)
			});
		}
	}
};