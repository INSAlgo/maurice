const db = require('../modules/database.js')

module.exports = {

	route : '/mult',
	method : 'post',
	callback : function(req, res) {

  		let json = req.body;
  		if ( !json.slug || !json.multiplier || json.slug.constructor.name != "String" || json.multiplier.constructor.name != "Number" )
  		  res.status(400).send('wrong data provided. are you dumb, stupid or dumb ? huh?');
  		
  		else {
		
  		  db.applyMultiplier(json.slug, json.multiplier)
  		  .then(updated => {
		
  		    if (updated)
  		      res.sendStatus(200)
  		    else
  		      res.status(400).send(`slug ${json.slug} provided doesn't correspond to any registered challenges`)
		
  		  })
  		  .catch(err => res.status(err.httpCode).send(err.msg))
  		}
	}
}

