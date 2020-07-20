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
	getScoreboard : getScoreboard,
	applyMultiplier : applyMultiplier,
	updateScoreboard : updateScoreboard,
	isUserRegistered : isUserRegistered,
	specialChallenges : specialChallenges,
	loadAllAlgorithms : loadAllAlgorithms,
	applyCategoryMultiplier : applyCategoryMultiplier,

	// TODO : remove access later
	getOnlineAlgorithmCount : getOnlineAlgorithmCount,
	getDatabaseAlgorithmCount : getDatabaseAlgorithmCount
}


function connect(callback) {
	
	client.connect(err => {
	  if (!err)
	    callback(err);
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

async function specialChallenges() {

	return selectSchema()
	.then( () => client.query(`SELECT * FROM ${db_info.algorithms_table} WHERE ${db_info.algorithms_table}.multiplier != 1;`))
	.then( (res) => { console.log(`[api][special] found ${res.rows.length} special challenges`); return res.rows})
	.catch(err => { 
		console.error(`[api][special] error occurred while trying to retrieve special challenges`, err.stack);
		throw new APIError(500, "Couldn't retrieve special challenges") 
	})
}

async function applyMultiplier(slug, mult) {

	return selectSchema()
	.then( () => client.query(`UPDATE ${db_info.algorithms_table} SET multiplier=${mult} WHERE ${db_info.algorithms_table}.slug='${slug}';`))
	.then( res => {
		const updated = res.rowCount == 1;
		if (updated) 
			console.log(`[api][multiplier] modified challenge ${slug} multiplier to ${mult}`)
		else
			console.log(`[api][multiplier] slug ${slug} provided doesn't correspond to any registered challenge`)
		return updated
	})
	.catch(err => { 
		console.error(`[api][multiplier] error occurred while trying to apply ${mult} to ${slug}`, err.stack);
		throw new APIError(500, `Couldn't apply multiplier ${mult} to ${slug}`); 
	})
}

async function applyCategoryMultiplier(cat, mult) {

	return selectSchema()
	.then( () => client.query(`UPDATE ${db_info.algorithms_table} SET multiplier=${mult} WHERE ${db_info.algorithms_table}.category='${cat}';`))
	.then( res => {
		const updated = res.rowCount > 0;
		if (updated) 
			console.log(`[api][multipliercat] modified category ${cat} multiplier to ${mult}`)
		else
			console.log(`[api][multipliercat] category ${cat} provided doesn't correspond to any registered category`)
		return updated
	})
	.catch(err => { 
		console.error(`[api][multipliercat] error occurred while trying to apply ${mult} to ${cat}`, err.stack);
		throw new APIError(500, `Couldn't apply multiplier ${mult} to ${cat}`); 
	})
}

async function getScoreboard(limit) {
	
	return selectSchema()
	.then( () => client.query(`SELECT * FROM ${db_info.users_table} ORDER BY ${db_info.users_table}.score, ${db_info.users_table}.discord_id::bigint LIMIT ${limit};`))
	.then( (res) => { console.log(`[api][scoreboard] got ${res.rows.length} highest score holders`); return res.rows})
	.catch(err => { 
		console.error(`[api][scoreboard] error occurred while trying to retrieve scoreboard`, err);
		throw new APIError(500, "Couldn't retrieve scoreboard") 
	})
}

async function updateScoreboard() {

	return selectSchema() // select schema
	// retrieve all of the users infos
	.then( () => client.query(`SELECT ${db_info.users_table}.hr_username, ${db_info.users_table}.last_challenge_slug, ${db_info.users_table}.score FROM ${db_info.users_table}`))
	.then( res => { // treat the data for score to have Number type 
		
		for (let i = 0; i < res.rows.length; ++i)
			if (res.rows[i].score.constructor.name != "Number")
				res.rows[i].score = parseFloat(res.rows[i].score);

		return res.rows;

	}).then( (users) => { // query algorithms infos in sub-promise to keep access to users

		return client.query(`SELECT ${db_info.algorithms_table}.slug, ${db_info.algorithms_table}.difficulty, ${db_info.algorithms_table}.multiplier FROM ${db_info.algorithms_table}`)
		.then(res => { // treat data : put challenges in map for easier lookup for difficulty and multiplier

			let challenges = new Map();
			for (let i = 0; i < res.rows.length; ++i)
				challenges.set(res.rows[i].slug, { difficulty : res.rows[i].difficulty, multiplier : res.rows[i].multiplier})

			// return both data pieces into one object for the next promise
			return {
				users: users,
				challenges: challenges
			}
		})
	// back to "top-level" promise
	}).then(data => {

		// prepare get requests for first batch of recent algos
		const requests = [];
		for (let i = 0; i < data.users.length; ++i)
			requests.push(ax.get(hr_requests.getRecentResolved(data.users[i].hr_username, 20), hr_requests.default_options))

		// run the requests in safe-mode (if one crashes the others wont)
		return Promise.allSettled(requests).then(resps => {
 
 			// prepare a promise for each user to treat its data if the request was successful
 			let promises = [];
			for (let i = 0; i < resps.length; ++i) {
				if (resps[i].status !== "fulfilled") {
					console.error(`[api][update-scoreboard] user ${data.users[i].hr_username} produces error on hr api`)
					console.error(`reason : ${resps[i].reason}`)
					continue;
				}
				const user_response = resps[i].value;

				// promise that processes the user's recent challenges data
				const promise = new Promise((resol, rej) => {

					// evaluate score to add from the data gotten and fetch more data if needed
					evaluateUserScore(data.users[i], user_response, data.challenges)
					.then(res => {

						// set last challenge and new score
						return ax.get(hr_requests.getRecentResolved(data.users[i].hr_username, 1), hr_requests.default_options)
								.then(req_res => req_res.data.models[0].ch_slug)
								.then(slug => updateUserInfos(data.users[i].hr_username, res.score, slug))
								.then(rowCount => console.log(`[api] updated ${data.users[i].hr_username}'s score to ${res.score}`))
								.then( () => resol(res))
								.catch(err => {
									console.error('[api][update-scoreboard]', err)
									rej(err)
								})

					})
					.catch(err => rej(err))
				})

				promises.push(promise);
			}

			// run all promises
			return Promise.allSettled(promises)
		})
	// when the scores have been evaluated for all of the users
	}).then( results => { 

		// process data to remove failed requests and useless infos like "fulfilled" tag
		let treated_results = [];
		for (let res of results) {
			if (res.value != undefined)
				treated_results.push({
					hr_username: res.value.hr_username,
      				previousScore: res.value.previousScore,
      				score: res.value.score,
      				more: res.value.more != undefined ? res.value.more : ""
      			})
		}

		return treated_results;
	})
}

async function evaluateUserScore(user_info, user_response, challenges) {
	
	// easier access
	const last_challenge_slug = user_info.last_challenge_slug;

	// replace a dot by an underscore bc funny
	const user_response_data = user_response.data;
	const username = user_info.hr_username;
	let score = user_info.score;

	const unknownChallenges = [];

	// prepare function that gives a promise that gives the result of a http get request to hr api (last challenges from a cursor)
	const getRecentResolved = function(cursor, count) {

		return new Promise( (resol, rej) => {

			ax.get(hr_requests.getRecentResolvedFromCursor(username, count, cursor), hr_requests.default_options)
			.then(res => resol(res.data)).catch(err => rej(err))
		}) 
	}
	

	// evaluates the score deserved by a user for resolving a group of algos
	const evaluatePoints = function(response_data) { // TODO : add new completed challenges to result

		// if the guy resolved at least one algorithm (needed on top of the for to return properly)
		if (response_data.models.length > 0)
			// for each algorithm
			for (let i = 0; i < response_data.models.length; ++i) {
				const challenge = response_data.models[i];

				// if it isn't the last algorithm we check last time we updated the score (this means we're still on the recent side)
				if (challenge.ch_slug != last_challenge_slug && !(response_data.last_page && i == response_data.models.length - 1)) {
					const ch = challenges.get(challenge.ch_slug)
					if (ch != undefined) // if the algorithm is known
						score += parseFloat((hr_requests.difficultyToPoints(ch.difficulty) * ch.multiplier));
					else {
						console.log("unknown challenge")
						unknownChallenges.push( { ch_slug : challenge.ch_slug, "challenge" : challenge } )
					}

				}
				else return { hr_username : user_info.hr_username, previousScore : user_info.score, score : score, more : { stop_info : "normal behavior", "unknownChallenges" : unknownChallenges} }
			}
		else
			return { hr_username : user_info.hr_username, previousScore : user_info.score, score : score, more : { stop_info : "no algorithms resolved" } }

		// if we didn't return, there's still more algorithms to get from the api so let's do it fuckers
		return getRecentResolved(response_data.cursor, 1000) // get new request and response data from the api (1000 in case the max limit augments, we'll not have to get back here and modify it)
			   .then(next_response_data => evaluatePoints(next_response_data)); // use evaluate points again to process it
	}

	// only thing that is executed in this function : begins the recursion (if recursion is needed)
	return evaluatePoints(user_response_data);
}

async function updateUserInfos(hr_username, score, last_challenge_slug) {

	if (score.constructor.name != "Number")
		score = parseFloat(score);

	return selectSchema()
	.then( () => client.query(`UPDATE ${db_info.users_table} SET score=${score}, last_challenge_slug='${last_challenge_slug}' WHERE ${db_info.users_table}.hr_username='${hr_username}';`))
	.then(res => res.rowCount)
}

// TODO : then update last challenge