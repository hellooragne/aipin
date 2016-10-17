var express    = require('express');
var bodyParser = require('body-parser');
var path 	   = require('path');
var jsonParser = bodyParser.json();
var server     = express();

var log        = require('../../softpbx_tools/log/log.js')('|');
var router     = require('./route.js');

var settings   = {"port" : 8890};
/**
 * used to start the server, optional parameter is port
 * @param  {number} port server will run on the port
 */
function run(port) {
	configure();

	if (port && typeof port == 'number') {
		log.info('server run on 0.0.0.0:' +  port);
		server.listen(port);
	} else {
		if (!settings || !settings.port || typeof settings.port != 'number') {
			log.error('Please set the server port');
			log.info('Server shutdown');
			return;
		}

		log.info('server run on 0.0.0.0:' + settings.port);
		server.listen(settings.port);
	}
}

function configure() {

	var rootPath = path.resolve(__dirname, '..'); 
	log.setGlobalPath(rootPath);
	server.use(jsonParser);
	server.use(errHandler);
	server.use(router);
}
 
function errHandler(err, req, res, next) {
	if (err) {
		log.error(err.name + ':' + err.message);

		var statusCode = err.status || 500;
		var resBody    = (statusCode == 500? { error_msg : "server error"} : { error_msg : "something bad in your request" });
		log.info('statudCode ' + statudCode);
		log.info(resBody);
		res.status(statudCode).json(resBody);
	}
} 

module.exports = run;
