let { webUrl } = require('../config.json')
let axios = require('axios')

module.exports = {
	name: 'multcat',
	description: 'Applique un multiplicateur de points sur toute une catégorie de challenges donnée!',
	execute(client, msg, args) {

		if (args.length != 2 || isNaN(parseFloat(args[1]))) {
			msg.reply('Mauvais arguments donnés. Essaye : `!multcat <category> <multiplier>')
			return;
		}

		console.log(`[discord][multcat] trying to set category ${args[0]}'s multiplier to ${args[1]}`)
		
		axios.post(`http://${webUrl}/multcat`, 
			{
				category : args[0],
				multiplier : parseFloat(args[1])
			})
		.then(resp => console.log("[discord][multcat] sent multiplier modification request"))
		.catch(err => console.error(`[discord][multcat] ${err.response.status} ${err.response.statusText} : ${err.response.data}`));
	}
};