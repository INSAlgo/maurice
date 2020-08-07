const { updateDiscordScoreboard } = require('../server.js')
const APIError = require('../modules/api_error.js')
const db = require('../modules/database.js')
const emitter = global.emitter;

module.exports = {

	route : '/scoreboard_refresh',
	method : 'get',
	callback : function (req, res) {

      if (req.query.user) {
        db.isUserRegistered(req.query.user, " ")
        .then(result => result.discord_id)
        .then(result => {

          if (result)
            db.updateSingleUserScore({discord_id:req.query.user})
                .then(result => res.status(200).json(result))
                .catch(err => {

                if (err.constructor.name === "APIError")
                  res.status(err.httpCode).send(err.msg);
                else {
                  res.sendStatus(500)
                  console.err('[api][updateUser] error occurred while trying to update user ' + req.query.user, err.stack)
                }
                })
          else
            res.status(400).send("user doesn't exist")
        })
      } else
        globalUpdate(req, res);
	}
}

function globalUpdate(req, res) {

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

      updateDiscordScoreboard()
      .then(resetListeners(res, [200, "OK", ""]))
      .catch(resetListeners(res, [500, "Internal Server Error", ""]))
    }
    
    emitter.once('scoreboard-updated-api', success)
    emitter.once('scoreboard-update-failed-api', error)
    emitter.emit('scoreboard-update-api');
}