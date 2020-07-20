const { db_info } = require('./config.json');
const { Pool,  Client } = require('pg');
const client = new Client(db_info);
const APIError = require('./api_error.js');

module.exports = {

	connect : connect,
	isUserRegistered : isUserRegistered,
	insertUser : insertUser
}


function connect() {
	
	client.connect(err => {
	  if (!err)
	    console.log("[database] connected")
	});	
}

function selectSchema() {

	return client.query("SET search_path TO 'public';");
}

function isUserRegistered(discord_id, hr_username) {

	return selectSchema()
	.then(() => client.query(`SELECT COUNT(*) FROM public.users WHERE users.discord_id=$1;`, ["" + discord_id]))
	.then(discord_res => client.query(`SELECT COUNT(*) FROM public.users WHERE users.hr_username=$1;`, ["" + hr_username]).then(hr_res => 
			{
				return { 
					discord_id : (discord_res.rows[0].count > 0),
					hr_username : (hr_res.rows[0].count > 0)
				}
			}))

	// change to APIError
	.catch(err => console.error(err.stack));
}

function insertUser(discord_id, hr_username) {

	return selectSchema()
	.then(() => client.query(`INSERT INTO public.users(discord_id, hr_username) VALUES($1, $2);`, ["" + discord_id, "" + hr_username]))
	.then(res => res.rowCount == 1)
	.catch(err => { throw new APIError(400, "One of the provided information already exist in the database")})
}