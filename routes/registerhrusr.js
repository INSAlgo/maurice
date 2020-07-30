const { webUrl } = require('../config/web_api_config.json')
const hr_endpoints = require('../modules/hr_endpoints.js')
const APIError = require('../modules/api_error.js');
const db = require('../modules/database.js')
const ax = require('axios')

module.exports = {

  route : '/registerhrusr',
  method : 'post',
  callback : function (req, res) {

    if (!req.body || !req.body.discord_id || !req.body.hr_username)
      res.status(400).send('wrong data provided. are you dumb, stupid or dumb ? huh?');
    else
     registerhrusr(req.body).then(result => {

      return ax.get(`http://${webUrl}/scoreboard_refresh/`).then(ans => {

        if (result && ans && ans.status == 200) {
          console.log(`[api] bound ${req.body.discord_id} to hr account : ${req.body.hr_username}`);
          res.sendStatus(200);
        } else {
          res.sendStatus(500)
          throw new APIError(500, "failed to register user for unknown reasons")
        }
      })

     })
      .catch(err => {

       if (err.constructor.name === "APIError")
         res.status(err.httpCode).send(err.msg);
       else {
         console.error(err);
         res.sendStatus(500);
       }
     })
  }
}

// enregistre un utilisateur grâce à un body : {body.discord_id, body.hr_username}
async function registerhrusr(body) {

  // ajouter check base de donnée
  return db.isUserRegistered(body.discord_id, body.hr_username).then(in_use => {

    if (in_use.discord_id) {
      console.error(`[api] [check] user id ${body.discord_id} is already used`);
      throw new APIError(400, "Provided Discord ID is already used by another HackerRank account")
    }
    else if (in_use.hr_username) {
      console.log(`[api] [check] hr username ${body.hr_username} is already used`);
      throw new APIError(400, "Provided HackerRank account is already used by another Discord ID")
    }
    else
      return ax.get(hr_endpoints.getUser(body.hr_username), hr_endpoints.default_options)  // hackerrank account exists?
          .catch(err => {
              if (err.response.status == 404) {
                throw new APIError(400, "HackerRank account doesn't exist");
              } else
                console.error(err.stack);
            })
          .then(() => db.insertUser(body.discord_id, body.hr_username))
  });

}