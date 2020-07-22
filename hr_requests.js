const min = Math.min;
const max = Math.max;
const { difficultyEquivalents } = require('./web_api_config.json');

module.exports = {

	default_options : {
		headers: {
      		"Accept" : "application/json",
      		"User-Agent" : "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:78.0) Gecko/20100101 Firefox/78.0"
    	}
	},

	getUser : function(username) {

		return `https://www.hackerrank.com/rest/contests/master/hackers/${username}/profile`
	},

	getAlgorithmCount : function() {

		return "https://www.hackerrank.com/rest/contests/master/tracks/algorithms/challenges?offset=0&limit=0"
	},

	getAlgorithms : function(offset, count) {

		return `https://www.hackerrank.com/rest/contests/master/tracks/algorithms/challenges?offset=${offset}&limit=${min(max(0, count), 50)}"`
	},

	getMostRecentCursor : function(username, count) {

		return getRecentResolved(username, 1)
	},

	getRecentResolved : function(username, count) {
		
		return `https://www.hackerrank.com/rest/hackers/${username}/recent_challenges?limit=${min(max(0, count), 20)}&cursor=&response_version=v2`
	},

	getRecentResolvedFromCursor : function(username, count, cursor) {

		return `https://www.hackerrank.com/rest/hackers/${username}/recent_challenges?limit=${min(max(0, count), 20)}&cursor=${cursor}&response_version=v2`		
	},

	difficultyToPoints : function(difficulty_name) {

		return difficultyEquivalents[difficulty_name.toLowerCase()]
	},

	difficultyIndex : function(difficulty_name) {

		return Object.keys(difficultyEquivalents).indexOf(difficulty_name.toLowerCase())
	}
}