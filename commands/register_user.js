let { webUrl } = require('../config.json')
let axios = require('axios')

module.exports = {
	name: 'register',
	description: 'Register a HackerRank user ',
	execute(client, msg, args) {
		
		if (msg.mentions.members.size > 1 || args.length > 2)
			msg.reply('Mauvais nombre d\'arguments donnés. Essaye : `!register <@Utilisateur> <username HackerRank>')

		console.log(`[discord] trying to link HR account ${args[1]} to discord user ${args[0]}`)
		
		for (member of msg.mentions.members) {
			axios.post(`http://localhost:3000/registerhrusr`, 
				{
					discord_id : member[0],
					hr_username : args[args.length - 1]
				})
			.then(resp => console.log("[discord] sent register request")).catch(err => console.error(`[discord] ${err.response.status} ${err.response.statusText} : ${err.response.data}`));	
		}
	}
};