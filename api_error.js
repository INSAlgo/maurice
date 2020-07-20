class APIError extends Error {

  	constructor(httpCode, msg) {

    	super();
    	this.name = 'APIError';
    	this.httpCode = httpCode;
    	this.msg = msg;
  	}
 }

module.exports = APIError;

