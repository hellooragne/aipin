softpbx_db = require('../../softpbx_tools/db/');
var log    = require('../../softpbx_tools/log/log.js')('|');

var moment = require('moment');

var async = require('async');

var data_source_config = require('../../softpbx_tools/config/data_source.json');

var bill = {
	init : function() {

		softpbx_db.mysql_pool.connect(data_source_config['softpbx_db']);
	},

	get : function(data, callback) {

		var sql = "select *, date_format(start_time,'%Y-%m-%d %H:%i:%s') as start_time from bill where group_id = ? and to_days(start_time) >= to_days(now()) order by start_time";

		var values = [data.group_id];

		softpbx_db.mysql_pool.query(sql, values, function(err, results) {
			console.log(results);
			callback(err, results);
		});
	},


	get_one : function(data, callback) {

		var sql = "select *, date_format(start_time,'%Y-%m-%d %H:%i:%s') as start_time from bill where   bill_id = ? and to_days(start_time) >= to_days(now())  order by bill_id desc";

		var values = [data.bill_id];

		softpbx_db.mysql_pool.query(sql, values, function(err, results) {
			console.log(results);
			callback(err, results);
		});
	},


	get_my : function(data, callback) {

		//var sql = "select *, date_format(start_time,'%Y-%m-%d %H:%i:%s') as start_time from bill where group_id = ? and  phone_id = ? and to_days(start_time) >= to_days(now())  order by bill_id desc";
		//var values = [data.group_id, data.phone_id];

		var sql = "select *, date_format(start_time,'%Y-%m-%d %H:%i:%s') as start_time from bill where phone_id = ? and to_days(start_time) >= to_days(now())  order by bill_id desc";

		var values = [data.phone_id];

		softpbx_db.mysql_pool.query(sql, values, function(err, results) {
			console.log(results);
			callback(err, results);
		});
	},


	get_my_join : function(data, callback) {

		//var sql = "select *, date_format(start_time,'%Y-%m-%d %H:%i:%s') as start_time from bill where group_id = ? and  phone_id = ? and to_days(start_time) >= to_days(now())  order by bill_id desc";
		//var values = [data.group_id, data.phone_id];

		var sql = "select *,  date_format(start_time,'%Y-%m-%d %H:%i:%s') as start_time from bill where bill_id in (select bill_id from bill_join where phone_id = ? and to_days(start_time) >= to_days(now()))  order by bill_id desc";

		var values = [data.phone_id];

		softpbx_db.mysql_pool.query(sql, values, function(err, results) {
			console.log(results);
			callback(err, results);
		});
	},

	add : function(data, callback) {


		var sql = "select *, count(*) c from user where phone_id = ?";

		var values = [data.phone_id];

		softpbx_db.mysql_pool.query(sql, values, function(err, results) {

			console.log(results);
			if (results[0].c != 0) {
			
				var sql = "insert into bill (group_id, bill_name, s_from, s_to, start_time, phone_id, seat_number, s_type, create_time, username, picture) value (?, ?, ?, ?, ?, ?, ?, ?, now(), ?, ?)";

				var values = [data.group_id, data.bill_name, data.s_from, data.s_to, moment(data.start_time).subtract(8, 'hour').format("YYYY-MM-DD HH:mm:ss"), data.phone_id, data.seat_number, data.s_type, results[0].username, results[0].picture];

				softpbx_db.mysql_pool.query(sql, values, function(err, results2) {
					console.log(results2);
					callback(err, results2);
				});
			
			}

			

		});

		
	
	},

};

module.exports = bill;
