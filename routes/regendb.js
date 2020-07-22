const db = require('../modules/database.js')
let lastRegen = 0;

module.exports = {

  route : '/regendb',
  method : 'get',
  callback : function (req, res) {
      
    // TODO : security check
    if (Math.abs(lastRegen - (lastRegen = Date.now())) > 10*1000)
      db.loadAllAlgorithms()
      .then(dat => res.status(200).json(dat))
      // un catch général, y'a beaucoup de raisons qui font que ça peut rater
      // TODO : plusieurs catch en amont qui rethrowent une APIError correcte
      .catch(err => {
        console.error("[api][regendb] error occurred while doing regendb : " + err.stack)
        res.sendStatus(500);
      })
    else
      res.status(429).send('stop spamming u dumb fuck')
  }
}