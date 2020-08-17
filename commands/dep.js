let { webUrl } = require('../config/maurice_config.json')
let departs = require('../modules/departs.js')(webUrl);

module.exports = {
	name: '?',
	description: '?',
	usage: `<secret>`,
	execute(client, msg, args) {

		departs.tryDeparts(args[0], msg);
	}
};