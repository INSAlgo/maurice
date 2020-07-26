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
  		      res.status(200).json(qres)
  		  }
  		  else
  		    res.status(400).send(`category ${json.category} provided doesn't correspond to any registered challenges`)
  		})
  		.catch(err => console.error(err))
  		.catch(err => res.status(err.httpCode).send(err.msg))
	}
}