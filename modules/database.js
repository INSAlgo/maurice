const { db_info, date_lower_bound } = require('../config/web_api_config.json');
const hr_endpoints = require('./hr_endpoints.js')
const APIError = require('./api_error.js');
const { Pool,  Client } = require('pg');
const client = new Client(db_info);
const pgf = require('pg-format')
const ax = require('axios');

module.exports = {

	connect : connect,
	getUser : getUser,
	insertUser : insertUser,
	getUserCount : getUserCount,
	getScoreboard : getScoreboard,
	applyMultiplier : applyMultiplier,
	updateScoreboard : updateScoreboard,
	isUserRegistered : isUserRegistered,
	specialChallenges : specialChallenges,
	loadAllAlgorithms : loadAllAlgorithms,
	updateSingleUserScore : updateSingleUserScore,
	applyCategoryMultiplier : applyCategoryMultiplier
}


function connect(callback) {
	
	client.connect(err => {
	  if (!err)
	    callback(err);
	  else {
	  	
  		console.error("[startup] failed to connect to database, check db status & config files")
  		console.error(err)
	  }
	});	
}

async function selectSchema() {

	return client.query(`SET search_path TO '${db_info.schema}';`);
}

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
		requests.push(ax.get(hr_endpoints.getAlgorithms(i, step), hr_endpoints.default_options))

	return ax.all(requests)
		.catch(err => {
			console.err("[api][regendb]" + err.stack)
			throw new APIError(504, "impossible to get all of the algorithms from hackerrank's api ")
		})
		.then(ax.spread( (...resps) => {
		const models = [];
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
		.catch(err => {
			console.err("[api][regendb]" + err.stack)
			throw new APIError(500, "error trying to communicate with db ")
		})
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
	.then( () => client.query(`SELECT * FROM ${db_info.users_table} ORDER BY ${db_info.users_table}.score DESC, ${db_info.users_table}.discord_id::bigint LIMIT ${limit};`))
	.then( (res) => res.rows)
	.catch(err => { 
		console.error(`[api][scoreboard] error occurred while trying to retrieve scoreboard`, err);
		throw new APIError(500, "Couldn't retrieve scoreboard") 
	})
}

async function getOnlineAlgorithmCount() {

	return ax.get(hr_endpoints.getAlgorithmCount(), hr_endpoints.default_options)
		.then(res => res.data.total)
		.catch(err => {
			console.err("[api][hr_algo_count]" + err.stack)
			throw new APIError(504, "error while trying to access hackerrank's api")
		})
}

async function getDatabaseAlgorithmCount() {

	return selectSchema()
		.then(() => client.query(`SELECT COUNT(*) FROM ${db_info.algorithms_table}`))
		.then(res => res.rows[0].count)
		.catch(err => {
			console.err("[api][db_algo_count]" + err.stack)
			throw new APIError(500, "error while trying to read from db")
		})
}

async function getUserCount() {

	return selectSchema()
		.then( () => client.query(`SELECT COUNT(*) FROM ${db_info.users_table}`))
		.then( res => res.rows[0] )
}

async function getUser(partial_user_info) {

	if ((partial_user_info.discord_id && partial_user_info.hr_username) || (!partial_user_info.discord_id && !partial_user_info.hr_username))
		throw new Error(`provided info isn't partial`)
	else
		return partial_user_info.discord_id ? getUserFromDiscordID(partial_user_info.discord_id) : getUserFromHRUsername(partial_user_info.hr_username)
}

async function getUserFromDiscordID(discord_id) {

	return isUserRegistered(discord_id, "idc_about_what_this_will_do")
		.then(is_registered => is_registered.discord_id)
		.then(id_exists => {
			if (id_exists)
				return selectSchema()
					.then( () => client.query(`SELECT ${db_info.users_table}.discord_id, ${db_info.users_table}.hr_username, ${db_info.users_table}.last_challenge_slug, ${db_info.users_table}.score FROM ${db_info.users_table} WHERE ${db_info.users_table}.discord_id ='${discord_id}'`))
					.then( res => {
						if (res.rows.length > 0)
							return res.rows[0]
						else
							throw new APIError(400, "provided discord id isn't registered")
					})
			else
				throw new APIError(400, "provided discord id isn't registered")
		})
}

async function getUserFromHRUsername(hr_username) {

	return isUserRegistered("idc_about_what_this_will_do", hr_username)
		.then(is_registered => is_registered.hr_username)
		.then(username_exists => {
			if (username_exists)
				return selectSchema()
					.then( () => client.query(`SELECT ${db_info.users_table}.discord_id, ${db_info.users_table}.hr_username, ${db_info.users_table}.last_challenge_slug, ${db_info.users_table}.score FROM ${db_info.users_table} WHERE ${db_info.users_table}.hr_username='${hr_username}'`))
					.then( res => {
						if (res.rows.length > 0)
							return res.rows[0]
						else
							throw new APIError(400, "provided hr username isn't registered")
					})
			else
				throw new APIError(400, "provided hr username isn't registered")
		})
}

async function getAllUsers() {

	return selectSchema()
		.then( () => client.query(`SELECT ${db_info.users_table}.discord_id, ${db_info.users_table}.hr_username, ${db_info.users_table}.last_challenge_slug, ${db_info.users_table}.score FROM ${db_info.users_table}`))
		.then( res => { // treat the data for score to have Number type

			for (let i = 0; i < res.rows.length; ++i)
				if (res.rows[i].score.constructor.name !== "Number")
					res.rows[i].score = parseFloat(res.rows[i].score);

			return res.rows;

		})
}

async function getAllChallenges() {

	return selectSchema().then( () => client.query(`SELECT ${db_info.algorithms_table}.slug, ${db_info.algorithms_table}.difficulty, ${db_info.algorithms_table}.multiplier FROM ${db_info.algorithms_table}`))
		.then(res => {

			// treat data : put challenges in map for easier lookup for difficulty and multiplier
			let challenges = new Map();
			for (let i = 0; i < res.rows.length; ++i)
				challenges.set(res.rows[i].slug, { difficulty : res.rows[i].difficulty, multiplier : res.rows[i].multiplier})

			return challenges
		})
}

async function updateScoreboard() {

	return getAllUsers()
	.then( (users) => { // query algorithms infos in sub-promise to keep access to users

		return getAllChallenges()
		.then(challenges => {

			// return both data pieces into one object for the next promise
			return {
				users: users,
				challenges: challenges
			}
		})
	// back to "top-level" promise
	}).then(data => {

		// run the requests in safe-mode (if one crashes the others wont)
		return Promise.allSettled(makeScoreEvaluationPromises(data)) // evaluate scores

	// when the scores have been evaluated for all of the users
	}).then( results => { 

		// process data to remove failed requests and useless infos like "fulfilled" tag
		const treated_results = [];
		const errors = [];
		for (let res of results) {
			if (res.value !== undefined) {
				treated_results.push({
					discord_id : res.value.discord_id,
					hr_username: res.value.hr_username,
      				previousScore: res.value.previousScore,
      				score: res.value.score,
      				more: res.value.more ? res.value.more : ""
      			})
			}
			else
				errors.push(res)
		}

		return { treated_results : treated_results, errors : errors } ;
	}).then(obj => {
		console.log(obj.errors)
		return obj.treated_results;
	})
}

async function updateSingleUserScore(partial_user_info) {

	return getUser(partial_user_info)
		.then(user_info => {
			return getAllChallenges()
				.then(challenges_map => makeUserScoreUpdatePromise(user_info, challenges_map))
		})
		.then(result => result)
}

// used only in updateScoreboard()
function makeScoreEvaluationPromises(data) {

	// prepare a promise for each user to treat its data if the request was successful
 	const promises = [];
	for (let i = 0; i < data.users.length; ++i)
		// promise that processes the user's recent challenges data
		promises.push(makeUserScoreUpdatePromise(data.users[i], data.challenges));

	return promises;
}

// user_info : {hr_username, discord_id, last_challenge_slug, score}
async function makeUserScoreUpdatePromise(user_info, challenges) {

	return ax.get(hr_endpoints.getRecentResolved(user_info.hr_username, 1000), hr_endpoints.default_options)
		.then(resp => {
			if (resp.status !== 200) {

				console.error(`[api][update-scoreboard] user ${data.users[i].hr_username} produces error on hr api`)
				console.error(`reason : ${resps[i].reason}`)
				throw new APIError(400, `hr api sent back error : ${resp.status} : ${resp.statusText}`)
			} else
				return resp.data;
		})
		.then(data => new Promise((resol, rej) => {
			// evaluate score to add from the data gotten and fetch more data if needed
			loopThroughRecentChallenges(user_info, data, challenges)
				.then(res => {
					// set last challenge and new score
					return updateUserDBInfos(res.hr_username, res.score, res.last_challenge_slug, res.more.newChallenges.length, res.more.unknownChallenges.length)
						.then(rowCount => console.log(`[api] updated ${user_info.hr_username}'s score to ${res.score} thanks to ${res.more.newChallenges.length} new challenges resolved (sadly ${res.more.unknownChallenges.length} new unknowns)`))
						.then( () => resol(res))
						.catch(err => {
							console.error('[api][update-scoreboard]', err)
							rej(err)
						})
				})
				.catch(err => rej(err))
		}))
}

// loops through user's recent challenges and evaluates points from a starting point 'user_response_data'
async function loopThroughRecentChallenges(user_info, user_response_data, challenges) {

	// easier access
	const last_challenge_slug = user_info.last_challenge_slug;

	// replace a dot by an underscore bc funny
	const username = user_info.hr_username;
	let score = user_info.score;
	if (score.constructor.name !== "Number")
		try {
			score = parseFloat(score);
		} catch( err ) {
			throw new Error(`[api][update user] error while trying to retrieve user ${user_info.discord_id} | ${user_info.hr_username} score as a number`)
		}

	const unknownChallenges = [];
	const newChallenges = [];

	let new_last_challenge_slug = undefined;

	// prepare function that gives a promise that gives the result of a http get request to hr api (last challenges from a cursor)
	const getRecentResolved = function(cursor, count) {

		// CHECK : peut etre qu'un return ax.get(...) suffirait
		return new Promise( (resol, rej) => {

			ax.get(hr_endpoints.getRecentResolvedFromCursor(username, count, cursor), hr_endpoints.default_options)
				.then(res => resol(res.data)).catch(err => rej(err))
		})
	}

	// evaluates the score deserved by a user for resolving a group of algos
	const evaluatePoints = function(response_data) {

		// if the guy resolved at least one algorithm (needed on top of the for to return properly)
		if (response_data.models.length > 0)
			// for each algorithm
			for (let i = 0; i < response_data.models.length; ++i) {
				const challenge = response_data.models[i];

				// if it isn't the last algorithm we checked last time we updated the score (this means we're still on the recent side of the list)
				if (challenge.ch_slug !== last_challenge_slug && !(response_data.last_page && i === response_data.models.length - 1)) {
					const ch = challenges.get(challenge.ch_slug)
					if (ch) {// if the algorithm is known
						if ((new Date(challenge.created_at)).getTime() >= date_lower_bound) {
							score += parseFloat((hr_endpoints.difficultyToPoints(ch.difficulty) * ch.multiplier));
							newChallenges.push( {ch_slug : challenge.ch_slug, "challenge" : challenge } )
						}
					} else
						unknownChallenges.push( { ch_slug : challenge.ch_slug, "challenge" : challenge } )

					// now out of the if bc we want an accurate unknownChallenge count
					new_last_challenge_slug = !new_last_challenge_slug ? challenge.ch_slug : new_last_challenge_slug;
				}
				else return { discord_id : user_info.discord_id, hr_username : user_info.hr_username, previousScore : user_info.score, score : score, last_challenge_slug : (!new_last_challenge_slug ? last_challenge_slug : new_last_challenge_slug), more : { stop_info : "normal behavior", unknownChallenges : unknownChallenges, newChallenges : newChallenges } }
			}
		else
			return { discord_id : user_info.discord_id, hr_username : user_info.hr_username, previousScore : user_info.score, score : score, last_challenge_slug : (!new_last_challenge_slug ? last_challenge_slug : new_last_challenge_slug), more : { stop_info : "empty response, no challenges resolved?", unknownChallenges : unknownChallenges, newChallenges : newChallenges } }

		// if we didn't return, there's still more algorithms to get from the api so let's do it fuckers
		return getRecentResolved(response_data.cursor, 1000) // get new request and response data from the api (1000 in case the max limit augments, we'll not have to get back here and modify it)
			.then(next_response_data => evaluatePoints(next_response_data)); // use evaluate points again to process it
	}

	// only thing that is executed in this function : begins the recursion (if recursion is needed)
	return evaluatePoints(user_response_data);
}

// update user data in db
async function updateUserDBInfos(hr_username, score, last_challenge_slug, new_challenges_count, new_unknown_count) {

	if (score.constructor.name !== "Number")
		score = parseFloat(score);

	if (new_challenges_count.constructor.name !== "Number")
		new_challenges_count = parseFloat(new_challenges_count);

	if (new_unknown_count.constructor.name !== "Number")
		new_unknown_count = parseFloat(new_unknown_count);

	return selectSchema()
	.then( () => client.query(`UPDATE ${db_info.users_table} SET score=${score}, last_challenge_slug='${last_challenge_slug}', total_resolved=(total_resolved+${new_challenges_count}), total_unknown_resolved=(total_unknown_resolved+${new_unknown_count}) WHERE ${db_info.users_table}.hr_username='${hr_username}';`))
	.then(res => res.rowCount)
}
