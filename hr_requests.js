module.exports = {

	default_options : {
		headers: {
      		"Accept" : "application/json",
      		"User-Agent" : "maurice/1.0.0"
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

	getRecentResolved : function(username, count) {
		
		return `https://www.hackerrank.com/rest/hackers/${username}/recent_challenges?limit=${min(max(0, count), 20)}&cursor=&response_version=v2`
	},

	getRecentResolvedFromCursor : function(username, count, cursor) {

		return `https://www.hackerrank.com/rest/hackers/${username}/recent_challenges?limit=${min(max(0, count), 20)}&cursor=${cursor}&response_version=v2`		
	}
}