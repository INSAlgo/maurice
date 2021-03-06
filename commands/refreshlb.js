let { webUrl } = require('../config/maurice_config.json')
let axios = require('axios')

module.exports = {
	name: 'refreshlb',
	description: 'force le recalcul du tableau des scores (complet ou un seul utilisateur)',
	usage: 'refreshlb [username]',
	execute(client, msg, args) {
		
		axios.get(`http://${webUrl}/scoreboard_refresh${msg.mentions.members.size === 1 ? "?user=" + msg.mentions.members.first().id : ""}`)
			.then(resp => console.log("[discord][scoreboard_refresh] sent refresh request"))
			.catch(err => console.error(`[discord][scoreboard_refresh] ${err.response.status} ${err.response.statusText} : ${err.response.data}`))
	}
};