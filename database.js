const hr_requests = require('./hr_requests.js')
const { db_info } = require('./config.json');
const APIError = require('./api_error.js');
const { Pool,  Client } = require('pg');
const client = new Client(db_info);
const pgf = require('pg-format')
const ax = require('axios');

module.exports = {

	connect : connect,
	insertUser : insertUser,
	isUserRegistered : isUserRegistered,
	loadAllAlgorithms : loadAllAlgorithms,

	// TODO : remove access later
	getOnlineAlgorithmCount : getOnlineAlgorithmCount,
	getDatabaseAlgorithmCount : getDatabaseAlgorithmCount
}


function connect() {
	
	client.connect(err => {
	  if (!err)
	    console.log("[database] connected")
	});	
}

async function selectSchema() {

	return client.query(`SET search_path TO '${db_info.schema}';`);
}

// TODO : clean some shit (remove useless some selectSchema bullshit)

async function isUserRegistered(discord_id, hr_username) {

	return selectSchema()
	.then(() => client.query(`SELECT COUNT(*) FROM ${db_info.users_table} WHERE users.discord_id=$1;`, ["" + discord_id]))
	.then(discord_res => client.query(`SELECT COUNT(*) FROM ${db_info.users_table} WHERE users.hr_username=$1;`, ["" + hr_username]).then(hr_res => 
			{
				return { 
					discord_id : (discord_res.rows[0].count > 0),
					hr_username : (hr_res.rows[0].count > 0)
				}
			}))

	// change to APIError
	.catch(err => console.error(err.stack));
}

async function insertUser(discord_id, hr_username) {

	return selectSchema()
	.then(() => client.query(`INSERT INTO ${db_info.users_table}(discord_id, hr_username) VALUES($1, $2);`, ["" + discord_id, "" + hr_username]))
	.then(res => res.rowCount == 1)
	.catch(err => { throw new APIError(400, "One of the provided information already exist in the database")})
}

async function getOnlineAlgorithmCount() {

	return ax.get(hr_requests.getAlgorithmCount(), hr_requests.default_options)
	.then(res => res.data.total)
}

async function getDatabaseAlgorithmCount() {

	return selectSchema()
	.then(() => client.query(`SELECT COUNT(*) FROM ${db_info.algorithms_table}`))
	.then(res => res.rows[0].count)
	.catch(err => console.err("[api][db_algo_count]" + err.stack))
}

async function loadAllAlgorithms() {

	return selectSchema()
	.then( () => getDatabaseAlgorithmCount() ).then(dbCount => 
														getOnlineAlgorithmCount().then(onlineCount => { 
															return { 
																db : dbCount, 
																web : onlineCount, 
																is_full : dbCount == onlineCount 
															} 
														}))
	.then(countInfo => {

		if (!countInfo.is_full)
			return regenAlgorithmDatabase(countInfo.web);
		else
			return { db_size : countInfo.db, altered : 0};
	})
}

async function regenAlgorithmDatabase(total) {

	const step = 50;
	const requests = [];
	for (let i = 0; i < total; i+= 50)
		requests.push(ax.get(hr_requests.getAlgorithms(i, step), hr_requests.default_options))

	return ax.all(requests).then(ax.spread( (...resps) => {
		let models = [];
		let model;
		for (let i = 0; i < resps.length; ++i)
			for (let j = 0; j < resps[i].data.models.length; ++j) {

				model = resps[i].data.models[j];
				models.push([
					model.slug,
					model.difficulty_name.toLowerCase(),
					model.track.name.toLowerCase()
				])
			}

		return client.query(pgf(`INSERT INTO ${db_info.algorithms_table}(slug, difficulty, category) VALUES %L ON CONFLICT DO NOTHING`, models))
		.then(res => { console.log(`[api][regendb] added ${res.rowCount} algorithms to the db`); return res.rowCount })
	})).then(altered => getDatabaseAlgorithmCount().then(count => { return { db_size : count, altered : altered } }))
}