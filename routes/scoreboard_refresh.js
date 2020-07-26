const emitter = global.emitter;
const { updateDiscordScoreboard } = require('../server.js')

module.exports = {

	route : '/scoreboard_refresh',
	method : 'get',
	callback : function (req, res) {

	    // on utilise les events ici psq scoreboard-update utilise les event pour se trigger périodiquement
  		// c'est plus simple comme ça
  		const resetListeners = function(res, info) {
		
  		  emitter.removeListener('scoreboard-updated-api', success);
  		  emitter.removeListener('scoreboard-update-failed-api', error);
  		  try {
  		    res.status(info[0]).send(`${info[1]} ${ (info[2] && info[2].length > 0) ? `=> ${info[2]}` : ""}`);
  		  } catch(err) {
  		    // déjà répondu on s'en branle
  		  }
  		}
  		const error = (code, desc, text) => resetListeners(res, [code, desc, text])
  		const success = () => {

        // TODO CHECK IF WORKING ????		
  		  updateDiscordScoreboard()
  		  .then(resetListeners(res, [200, "OK", ""]))
  		  .catch(resetListeners(res, [500, "Internal Server Error", ""]))
  		}
		
  		emitter.once('scoreboard-updated-api', success)
  		emitter.once('scoreboard-update-failed-api', error)
  		emitter.emit('scoreboard-update-api');
	}
}