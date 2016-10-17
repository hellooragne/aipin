softpbx_db = require('../../softpbx_tools/db/');
var log    = require('../../softpbx_tools/log/log.js')('|');

var moment = require('moment');

var async = require('async');

var data_source_config = require('../../softpbx_tools/config/data_source.json');

var bill_join = {
	init : function() {

		softpbx_db.mysql_pool.connect(data_source_config['softpbx_db']);
	},

	get : function(data, callback) {

		var sql = "select *, date_format(create_time,'%Y-%m-%d %H:%m:%s') as create_time from bill_join where bill_id = ? order by create_time";

		var values = [data.bill_id];

		softpbx_db.mysql_pool.query(sql, values, function(err, results) {
			console.log(results);
			callback(err, results);
		});
	},

	add : function(data, callback) {

		var sql = "insert into bill_join (bill_id, phone_id, username, picture, create_time) value (?, ?, ?, ?, now())";

		var values = [data.bill_id, data.phone_id, data.username, data.picture];

		softpbx_db.mysql_pool.query(sql, values, function(err, results) {
			console.log(results);
			callback(err, results);
		});
	
	},

};

module.exports = bill_join;
