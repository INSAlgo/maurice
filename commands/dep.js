let departs = require('../departs.js')("88.138.153.165:3000");

module.exports = {
	name: 'dep',
	description: 'Donne des infos sur un départ!',
	execute(client, msg, args) {

		departs.tryDeparts(args[0], msg);
	}
};