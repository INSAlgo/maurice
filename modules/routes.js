const fs = require('fs')
const routes = new Map();

const loadRoutes = function(app) {

	const routesFiles = fs.readdirSync('./routes').filter(file => file.endsWith('.js'));

	for (const file of routesFiles) {
	  const route = require(`../routes/${file}`);
	  routes.set(route.route, route);
	  app[route.method] && app[route.method].constructor.name === "Function" && app[route.method] && app[route.method](route.route, route.callback);
	}

	return routes
}

module.exports = {

	routes : routes,
	loadRoutes : loadRoutes
}