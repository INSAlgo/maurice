const { prettyPrintScoreboard } = require('../modules/print_utils.js')
const db = require('../modules/database.js')

module.exports = {

	route : '/scoreboard',
	method : 'get',
	callback : function (req, res) {

    console.log(req.query)
	  db.getScoreboard(req.query.limit || 10)
  		.then(qres => {
		
  		  if (qres) {
  		    if (req.query.pretty)
  		      res.status(200).send(prettyPrintScoreboard(qres))
  		    else
            db.getUserCount().then(userCount => res.status(200).json( {users : qres, total : userCount.count} ));
  		  }
  		  else
  		    res.status(500).send(`error occurred while attempting to get scoreboard`)
  		})
  		.catch(err => console.error(err))
  		.catch(err => res.status(err.httpCode).send(err.msg))
	}
}