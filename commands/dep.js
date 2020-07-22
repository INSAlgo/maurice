let { webUrl } = require('../config/maurice_config.json')
let departs = require('../modules/departs.js')(webUrl);

module.exports = {
	name: 'dep',
	description: 'Donne des infos sur un départ!',
	execute(client, msg, args) {

		departs.tryDeparts(args[0], msg);
	}
};