let { webUrl } = require('../config.json')
let departs = require('../departs.js')(webUrl);

module.exports = {
	name: 'dep',
	description: 'Donne des infos sur un départ!',
	execute(client, msg, args) {

		departs.tryDeparts(args[0], msg);
	}
};