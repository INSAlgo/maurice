let { prefix, webUrl } = require('../config/maurice_config.json')
let axios = require('axios')

module.exports = {
	name: 'mult',
	description: 'applique un multiplicateur de points sur un challenge donné',
	usage: 'mult <slug-challenge> <multiplier>',
	execute(client, msg, args) {

		if (args.length !== 2 || isNaN(parseFloat(args[1]))) {
			msg.reply('Mauvais arguments donnés. Essaye : `'+ prefix + this.usage + '`')
			return;
		}

		console.log(`[discord][mult] trying to set challenge ${args[0]}'s multiplier to ${args[1]}`)
		
		axios.post(`http://${webUrl}/mult`, 
			{
				slug : args[0],
				multiplier : parseFloat(args[1])
			})
		.then(resp => console.log("[discord][mult] sent multiplier modification request"))
		.catch(err => console.error(`[discord][mult] ${err.response.status} ${err.response.statusText} : ${err.response.data}`));
	}
};