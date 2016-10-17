var runServer = require('./server.js');

var system_config = require('../../softpbx_tools/config/system.json');

//start the server
if (process.argv.length >= 3)
{
	runServer(parseInt(system_config['aipin_core']['port']));
} else {
	runServer(parseInt(system_config['aipin_core']['port']));
}
