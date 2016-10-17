softpbx_db = require('../../softpbx_tools/db/');

var phonelist = {
	init : function() {
		var settings = {
			"host" : "10.2.58.197",
			"user" : "root",
			"password" : "123456",
			"database" : "opensips"
		};
		softpbx_db.mysql.connect(settings);
	},

	query : function(callback) {
		
		softpbx_db.mysql.query("select * from subscriber", function(err, results) {
			console.log(results);
			callback(err, results);
		});
	},

	topology : function(callback) {

		softpbx_db.mysql.query("select * from load_balancer", function(err, results) {
			console.log(results);
			callback(err, results);
		});
	},

};

module.exports = phonelist;
