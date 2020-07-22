const db = require('../modules/database.js')

module.exports = {

	route : '/lowik',
	method : 'get',
	callback : function (req, res) {

		res.status(200).send(`<html><head></head><body><img src="https://i.kym-cdn.com/photos/images/newsfeed/001/550/907/d41.jpg" /><audio
			autoplay src="https://www.mboxdrive.com/there-is-no-meme-take-off-your-clothes.mp3"></audio></body></html>`);
	}
}