softpbx_db = require('../../softpbx_tools/db/');
var log    = require('../../softpbx_tools/log/log.js')('|');

var moment = require('moment');

var async = require('async');

var data_source_config = require('../../softpbx_tools/config/data_source.json');

var user = {
	init : function() {

		softpbx_db.mysql_pool.connect(data_source_config['softpbx_db']);
	},

	match : function(data, callback) {

		var sql = "select count(*) is_match , username, picture from user where phone_id = ? and password = ?";

		var values = [data.phone_id, data.password];

		softpbx_db.mysql_pool.query(sql, values, function(err, results) {
			console.log(results);
			callback(err, results);
		});
	},

	add : function(data, callback) {
		var sql = "insert into user (username, phone_id, password, picture, sex) value (?, ?, ?, ?, ?)";

		var values = [data.username, data.phone_id, data.password, data.picture, data.sex];

		softpbx_db.mysql_pool.query(sql, values, function(err, results) {
			console.log(results);
			callback(err, results);
		});
	
	},

};

module.exports = user;
