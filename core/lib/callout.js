softpbx_db = require('../../softpbx_tools/db/');

<<<<<<< HEAD
var callout = {
	init : function() {
=======
var data_source_config = require('../../softpbx_tools/config/data_source.json');

var callout = {
	init : function() {

        /*
>>>>>>> ca2204058bba024f2a01f61241d1187ac6a86c84
		var settings = {
			"host" : "10.2.58.197",
			"user" : "root",
			"password" : "123456",
			"database" : "opensips"
		};
		softpbx_db.mysql.connect(settings);
<<<<<<< HEAD
=======
        */

		softpbx_db.mysql.connect(data_source_config['softpbx_db']);
>>>>>>> ca2204058bba024f2a01f61241d1187ac6a86c84
	},

	callout_line : function(callback) {
		
		softpbx_db.mysql.query("select * from callout_line", function(err, results) {
			console.log(results);
			callback(err, results);
		});
	},

	callout_queue : function(callback) {
		
		softpbx_db.mysql.query("select * from callout_queue", function(err, results) {
			console.log(results);
			callback(err, results);
		});
	},

	callout_operator : function(callback) {

		softpbx_db.mysql.query("select * from callout_operator", function(err, results) {
			console.log(results);
			callback(err, results);
		});
	},

	callout_phone : function(callback) {
		
		softpbx_db.mysql.query("select * from callout_phone", function(err, results) {
			console.log(results);
			callback(err, results);
		});
	},

	


};

module.exports = callout;
