let { webUrl } = require('../config/maurice_config.json')
let axios = require('axios')

module.exports = {
	name: 'refreshlb',
	description: 'Force le recalcul du tableau des scores !',
	execute(client, msg, args) {
		
		axios.get(`http://${webUrl}/scoreboard_refresh`)
			.then(resp => console.log("[discord][scoreboard_refresh] sent refresh request"))
			.catch(err => console.error(`[discord][scoreboard_refresh] ${err.response.status} ${err.response.statusText} : ${err.response.data}`));
	}
};