softpbx_db = require('../../softpbx_tools/db/');
var log    = require('../../softpbx_tools/log/log.js')('|');

var moment = require('moment');

var async = require('async');

var data_source_config = require('../../softpbx_tools/config/data_source.json');

var acd = {
	init : function() {

		softpbx_db.mysql_pool.connect(data_source_config['softpbx_db']);
	},

	topology : function(callback) {

		softpbx_db.mysql_pool.query("select * from load_balancer", function(err, results) {
			console.log(results);
			callback(err, results);
		});
	},

    call_list_set : function(queue, callback) {

        var d = new Date();

        var sql = "select FLOOR((duration) / 5) time, COUNT(1) count FROM ss_cdr where direction = 'outbound' and cc_queue = ? group by FLOOR(DURATION / 5) and end_stamp >= DATE_SUB('"  + moment(d).format("YYYY-MM-DD HH:mm:ss") + "', interval 1 DAY)";

        var values = [queue];

		softpbx_db.mysql_pool.query(sql, values, function(err, results) {
			console.log(results);

            var call_list = [];
            var total_call = 0;
            for (var i = 0; i < 60; i++) {
                call_list[i] = 0;
            }

            for (var i = 0; i < results.length; i++) {

                if (results[i]['time'] + 1 > 60) {
                    break;
                }
                call_list[results[i]['time'] + 1] = results[i]['count'];

                total_call += results[i]['count'];
            }

            var res = {
                "call_list" : call_list,
                "create_time" : new Date(),
                "total_call"  : total_call,
                "queue" : queue
            }
            
            
            softpbx_db['softpbx_call_list'].insert(res, function(err, docs) {

            });

		});
	},

    call_list_get : function(queue, callback) {

        softpbx_db['softpbx_call_list'].find({"queue":queue}).sort({"create_time":-1}).limit(1).toArray(function(err, docs) {

            str = JSON.stringify(docs);
            log.info(str);
            callback(err, str);

        });
    },

    
    abandon_list_set : function(queue, callback) {


        var d = new Date();

        var sql = "select * from (select count(*) total_num from ss_cdr where direction = 'inbound' and cc_queue = ? and end_stamp >= DATE_SUB('"  + moment(d).format("YYYY-MM-DD HH:mm:ss") + "', interval 1 HOUR)) t1, (select count(*) success_num from ss_cdr where  direction = 'inbound' and cc_queue = ? and bleg_uuid != ''  and end_stamp >= DATE_SUB('"  + moment(d).format("YYYY-MM-DD HH:mm:ss") + "', interval 1 HOUR)) t2";

        var values = [queue, queue];

		softpbx_db.mysql_pool.query(sql, values, function(err, results) {

			console.log(results);
            var res = {
                "abandon_list" : results,
                "create_time" : new Date(),
                "queue" : queue
            }

            softpbx_db['softpbx_abandon_list'].insert(res, function(err, docs) {

			    callback(err, docs);
            });
		});
	},
 
    abandon_list_get : function(queue, callback) {

        softpbx_db['softpbx_abandon_list'].find({"queue":queue}).sort({"create_time":-1}).limit(1).toArray(function(err, docs) {

            str = JSON.stringify(docs);
            log.info(str);
            callback(err, str);

        });
    },


	callout_statistics_set : function (queue, callback) {

		var d = new Date();
        d.setSeconds(0);
        d.setMinutes(0);
    
		var sql = "select * from (select count(*) total_num from ss_cdr where  callout_queue = ?  and end_stamp >= '"  + moment(d).format("YYYY-MM-DD HH:mm:ss") + "') t1, (select count(*) success_num from ss_cdr where callout_queue = ? and bleg_uuid != '' and end_stamp >= '"  + moment(d).format("YYYY-MM-DD HH:mm:ss") + "') t2, (select IFNULL(AVG(billsec), 0) average_call_time from ss_cdr where callout_queue = ? and bleg_uuid != '' and end_stamp >= '"  + moment(d).format("YYYY-MM-DD HH:mm:ss") + "') t3, (select IFNULL(AVG(ring), 0) average_ring_time from ( select  duration-billsec as ring from ss_cdr where callout_queue = ? and bleg_uuid != '' and end_stamp >= '"  + moment(d).format("YYYY-MM-DD HH:mm:ss") + "')tl1) t4";
        var values = [queue, queue, queue, queue];

		softpbx_db.mysql_pool.query(sql, values, function(err, results) {

			var res = {
                "callout_statistics" : results,
                "create_time" : new Date(),
                "queue" : queue
            }

			softpbx_db['callout_statistics'].insert(res, function(err, docs) {

			    callback(err, docs);
            });

		});
	},

	callout_statistics_get : function (queue, callback)  {

		softpbx_db['callout_statistics'].find({"queue":queue}).sort({"create_time":-1}).limit(1).toArray(function(err, docs) {

            str = JSON.stringify(docs[0]['callout_statistics']);
            log.info(str);
            callback(err, str);

        });
	},

    callout_statistics : function(queue, callback) {

        var d = new Date();
        d.setSeconds(0);
        //d.setMinutes(d.getMinutes() - d.getMinutes() % 5);
        d.setMinutes(0);
    
		/*
		*/
        var sql = "select * from (select count(*) total_num from ss_cdr where  callout_queue = ?  and end_stamp >= DATE_SUB('"  + moment(d).format("YYYY-MM-DD HH:mm:ss") + "', interval 10 minute )) t1, (select count(*) success_num from ss_cdr where callout_queue = ? and bleg_uuid != '' and end_stamp >= DATE_SUB('"  + moment(d).format("YYYY-MM-DD HH:mm:ss") + "', interval 10 minute )) t2, (select IFNULL(AVG(billsec), 0) average_call_time from ss_cdr where callout_queue = ? and bleg_uuid != '' and end_stamp >= DATE_SUB('"  + moment(d).format("YYYY-MM-DD HH:mm:ss") + "', interval 10 minute )) t3, (select IFNULL(AVG(ring), 0) average_ring_time from ( select  duration-billsec as ring from ss_cdr where callout_queue = ? and bleg_uuid != '' and end_stamp >= DATE_SUB('"  + moment(d).format("YYYY-MM-DD HH:mm:ss") + "', interval 10 minute ))tl1) t4";

        var sql = "select * from (select count(*) total_num from ss_cdr where  callout_queue = ?  and end_stamp >= '"  + moment(d).format("YYYY-MM-DD HH:mm:ss") + "') t1, (select count(*) success_num from ss_cdr where callout_queue = ? and bleg_uuid != '' and end_stamp >= '"  + moment(d).format("YYYY-MM-DD HH:mm:ss") + "') t2, (select IFNULL(AVG(billsec), 0) average_call_time from ss_cdr where callout_queue = ? and bleg_uuid != '' and end_stamp >= '"  + moment(d).format("YYYY-MM-DD HH:mm:ss") + "') t3, (select IFNULL(AVG(ring), 0) average_ring_time from ( select  duration-billsec as ring from ss_cdr where callout_queue = ? and bleg_uuid != '' and end_stamp >= '"  + moment(d).format("YYYY-MM-DD HH:mm:ss") + "')tl1) t4";
        var values = [queue, queue, queue, queue];

		softpbx_db.mysql_pool.query(sql, values, function(err, results) {

			callback(err, results);

		});


/*
        var d1 = new Date()
		async.parallelLimit([
			function(cb) { 
				var sql = "select count(*) total_num from ss_cdr where  callout_queue = ?  and end_stamp >= '"  + moment(d).format("YYYY-MM-DD HH:mm:ss") + "'";

        		var values = [queue];

				softpbx_db.mysql_pool.query(sql, values, function(err, results) {

                	var d2 = new Date()
					results['time'] = d2.getTime() - d1.getTime();

					cb("", results);

				});

			},
			function(cb) {  
				var sql = "select count(*) success_num from ss_cdr where callout_queue = ? and bleg_uuid != '' and end_stamp >= '"  + moment(d).format("YYYY-MM-DD HH:mm:ss") + "'";
        		var values = [queue];

				softpbx_db.mysql_pool.query(sql, values, function(err, results) {

					var d2 = new Date()
					results['time'] = d2.getTime() - d1.getTime();

					cb("", results);

				});
				
			},
			function(cb) {  
				var sql = "select IFNULL(AVG(billsec), 0) average_call_time from ss_cdr where callout_queue = ? and bleg_uuid != '' and end_stamp >= '"  + moment(d).format("YYYY-MM-DD HH:mm:ss") + "'";
        		var values = [queue];

				softpbx_db.mysql_pool.query(sql, values, function(err, results) {

					var d2 = new Date()
					results['time'] = d2.getTime() - d1.getTime();

					cb("", results);

				});
				
			},
			function(cb) {  
				var sql = "select IFNULL(AVG(ring), 0) average_ring_time from ( select  duration-billsec as ring from ss_cdr where callout_queue = ? and bleg_uuid != '' and end_stamp >= '"  + moment(d).format("YYYY-MM-DD HH:mm:ss") + "')tl1";
        		var values = [queue];

				softpbx_db.mysql_pool.query(sql, values, function(err, results) {

					var d2 = new Date()
					results['time'] = d2.getTime() - d1.getTime();

					cb("", results);

				});
				
			}
		],
	   
		3,

        function(err, values) {
			

            log.info("callout ------------------------------------------------");
			var d2 = new Date()
			log.info("total time: " + (d2.getTime() - d1.getTime()));
            log.info(values[0]);
            log.info(values[1]);
            log.info(values[2]);
            log.info(values[3]);

			var res = {
				total_num:values[0][0].total_num,
				success_num:values[1][0].success_num,
				average_call_time:values[2][0].average_call_time,
				average_ring_time:values[3][0].average_ring_time
			};

			callback(err, res);
        });

*/
    },


	callin_statistics_set : function (queue, callback) {

		var d = new Date();
        d.setSeconds(0);
        //d.setMinutes(d.getMinutes() - d.getMinutes() % 5);
        d.setMinutes(0);
    

        var sql = "select * from (select count(*) total_num from ss_cdr where direction = 'inbound' and cc_queue = ?  and end_stamp >= '"  + moment(d).format("YYYY-MM-DD HH:mm:ss") + "') t1, (select count(*) success_num from ss_cdr where direction = 'inbound' and  cc_queue = ? and bleg_uuid != '' and end_stamp >= '"  + moment(d).format("YYYY-MM-DD HH:mm:ss") + "') t2, (select IFNULL(AVG(billsec), 0) average_call_time from ss_cdr where direction = 'outbound' and cc_queue = ?  and end_stamp >= '"  + moment(d).format("YYYY-MM-DD HH:mm:ss") + "') t3, (select IFNULL(AVG(ring), 0) average_ring_time from ( select  duration-billsec as ring from ss_cdr where direction = 'outbound' and  cc_queue = ?  and end_stamp >= '"  + moment(d).format("YYYY-MM-DD HH:mm:ss") + "')tl1) t4";
        var values = [queue, queue, queue, queue];

		softpbx_db.mysql_pool.query(sql, values, function(err, results) {

			var res = {
                "callin_statistics" : results,
                "create_time" : new Date(),
                "queue" : queue
            }

			softpbx_db['callin_statistics'].insert(res, function(err, docs) {

			    callback(err, docs);
            });

		});

	},


	callin_statistics_get : function (queue, callback)  {

		softpbx_db['callin_statistics'].find({"queue":queue}).sort({"create_time":-1}).limit(1).toArray(function(err, docs) {
            str = JSON.stringify(docs[0]['callin_statistics']);
            log.info(str);
            callback(err, str);

        });
	},

    callin_statistics : function(queue, callback) {

        var d = new Date();
        d.setSeconds(0);
        //d.setMinutes(d.getMinutes() - d.getMinutes() % 5);
        d.setMinutes(0);
    
		/*
        var sql = "select * from (select count(*) total_num from ss_cdr where direction = 'inbound' and cc_queue = ?  and end_stamp >= DATE_SUB('"  + moment(d).format("YYYY-MM-DD HH:mm:ss") + "', interval 10 minute )) t1, (select count(*) success_num from ss_cdr where direction = 'inbound' and  cc_queue = ? and bleg_uuid != '' and end_stamp >= DATE_SUB('"  + moment(d).format("YYYY-MM-DD HH:mm:ss") + "', interval 10 minute )) t2, (select IFNULL(AVG(billsec), 0) average_call_time from ss_cdr where direction = 'outbound' and cc_queue = ?  and end_stamp >= DATE_SUB('"  + moment(d).format("YYYY-MM-DD HH:mm:ss") + "', interval 10 minute )) t3, (select IFNULL(AVG(ring), 0) average_ring_time from ( select  duration-billsec as ring from ss_cdr where direction = 'outbound' and  cc_queue = ?  and end_stamp >= DATE_SUB('"  + moment(d).format("YYYY-MM-DD HH:mm:ss") + "', interval 10 minute ))tl1) t4";
		*/

        var sql = "select * from (select count(*) total_num from ss_cdr where direction = 'inbound' and cc_queue = ?  and end_stamp >= '"  + moment(d).format("YYYY-MM-DD HH:mm:ss") + "') t1, (select count(*) success_num from ss_cdr where direction = 'inbound' and  cc_queue = ? and bleg_uuid != '' and end_stamp >= '"  + moment(d).format("YYYY-MM-DD HH:mm:ss") + "') t2, (select IFNULL(AVG(billsec), 0) average_call_time from ss_cdr where direction = 'outbound' and cc_queue = ?  and end_stamp >= '"  + moment(d).format("YYYY-MM-DD HH:mm:ss") + "') t3, (select IFNULL(AVG(ring), 0) average_ring_time from ( select  duration-billsec as ring from ss_cdr where direction = 'outbound' and  cc_queue = ?  and end_stamp >= '"  + moment(d).format("YYYY-MM-DD HH:mm:ss") + "')tl1) t4";
        var values = [queue, queue, queue, queue];

		softpbx_db.mysql_pool.query(sql, values, function(err, results) {

			callback(err, results);

		});

    
		/*
        var d1 = new Date()
		async.parallelLimit([
			function(cb) { 
				var sql = "select count(*) total_num from ss_cdr where direction = 'inbound' and cc_queue = ?  and end_stamp >= '"  + moment(d).format("YYYY-MM-DD HH:mm:ss") + "'";

        		var values = [queue];

				softpbx_db.mysql_pool.query(sql, values, function(err, results) {
		
					var d2 = new Date()
					results['time'] = d2.getTime() - d1.getTime();


					cb("", results);

				});

			},
			function(cb) {  
				var sql = "select count(*) success_num from ss_cdr where direction = 'inbound' and  cc_queue = ? and bleg_uuid != '' and end_stamp >= '"  + moment(d).format("YYYY-MM-DD HH:mm:ss") + "'";
        		var values = [queue];

				softpbx_db.mysql_pool.query(sql, values, function(err, results) {

					var d2 = new Date()
					results['time'] = d2.getTime() - d1.getTime();


					cb("", results);

				});
				
			},
			function(cb) {  
				var sql = "select IFNULL(AVG(billsec), 0) average_call_time from ss_cdr where direction = 'outbound' and cc_queue = ?  and end_stamp >= '"  + moment(d).format("YYYY-MM-DD HH:mm:ss") + "'";
        		var values = [queue];

				softpbx_db.mysql_pool.query(sql, values, function(err, results) {

					var d2 = new Date()
					results['time'] = d2.getTime() - d1.getTime();


					cb("", results);

				});
				
			},
			function(cb) {  
				var sql = "select IFNULL(AVG(ring), 0) average_ring_time from ( select  duration-billsec as ring from ss_cdr where direction = 'outbound' and  cc_queue = ?  and end_stamp >= '"  + moment(d).format("YYYY-MM-DD HH:mm:ss") + "')tl1";
        		var values = [queue];

				softpbx_db.mysql_pool.query(sql, values, function(err, results) {

					var d2 = new Date()
					results['time'] = d2.getTime() - d1.getTime();


					cb("", results);

				});
				
			}
		],
	
		2,
	    
        function(err, values) {
			

            log.info("callin ------------------------------------------------");
			var d2 = new Date()
			log.info("total time: " + (d2.getTime() - d1.getTime()));

            log.info(values[0]);
            log.info(values[1]);
            log.info(values[2]);
            log.info(values[3]);

			var res = {
				total_num:values[0][0].total_num,
				success_num:values[1][0].success_num,
				average_call_time:values[2][0].average_call_time,
				average_ring_time:values[3][0].average_ring_time
			};

			callback(err, res);
        });
*/
    },



	call_state_set : function (queue, callback) {
	
		var sql = "select * from (select count(*) callout_num from dialog where vars like ?)t1, (select count(*) callin_num from dialog where vars like ?)t2";

        var value1 = "%caller_queue#" + queue + "%";
        var value2 = "%callee_queue#" + queue + "%";

        var values = [value1, value2];

		softpbx_db.mysql_pool.query(sql, values, function(err, results) {

			var res = {
                "call_state" : results,
                "create_time" : new Date(),
                "queue" : queue
            }

			softpbx_db['call_state'].insert(res, function(err, docs) {

			    callback(err, docs);
            });

		});
	},


	call_state_get : function (queue, callback) {
	
		softpbx_db['call_state'].find({"queue":queue}).sort({"create_time":-1}).limit(1).toArray(function(err, docs) {

            str = JSON.stringify(docs[0]['call_state']);
            log.info(str);
            callback(err, str);

        });
	},



    call_state : function(queue, callback) {
    
		/*
		*/
        var sql = "select * from (select count(*) callout_num from dialog where vars like ?)t1, (select count(*) callin_num from dialog where vars like ?)t2";

        var value1 = "%caller_queue#" + queue + "%";
        var value2 = "%callee_queue#" + queue + "%";

        var values = [value1, value2];

		softpbx_db.mysql_pool.query(sql, values, function(err, results) {

			callback(err, results);

		});
        
		/*
		var d1 = new Date()

		async.parallelLimit([
			function(cb) { 
				var sql = "select count(*) callout_num from dialog where vars like ?";

        		var value1 = "%caller_queue#" + queue + "%";
        		var values = [value1];

				softpbx_db.mysql_pool.query(sql, values, function(err, results) {

					var d2 = new Date()
					results['time'] = d2.getTime() - d1.getTime();

					cb("", results);

				});

			},
			function(cb) {  
				var sql = "select count(*) callin_num from dialog where vars like ?";
        		var value2 = "%callee_queue#" + queue + "%";
        		var values = [value2];

				softpbx_db.mysql_pool.query(sql, values, function(err, results) {

					var d2 = new Date()
					results['time'] = d2.getTime() - d1.getTime();

					cb("", results);

				});
				
			}
		],

		1,
	    
        function(err, values) {
			

            log.info("call_state ------------------------------------------------");
			var d2 = new Date()
			log.info("total time: " + (d2.getTime() - d1.getTime()));
            log.info(values[0]);
            log.info(values[1]);

			var res = {
				callout_num:values[0][0].callout_num,
				callin_num:values[1][0].callin_num,
			};

			callback(err, res);
        });
		*/
    }

};

module.exports = acd;
