const db = require('../modules/database.js')

module.exports = {

	route : '/event',
	method : 'get',
	callback : function (req, res) {
		  
		db.specialChallenges().then( (rows) => res.status(200).json(rows) )
		  .catch(err => res.status(err.httpCode).send(err.msg))
	}
}