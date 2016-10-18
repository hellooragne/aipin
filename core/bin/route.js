var express    = require('express');
var router     = express.Router();

var user      = require('../lib/user');
var bill      = require('../lib/bill');
var bill_join = require('../lib/bill_join');

var log       = require('../../softpbx_tools/log/log.js')('|');

user.init();

router.get('/core/user/login', function(req, res) {

    user.match(req.query, function(req, results) {
        log.info(results);
		res.status(200).send(results);
    });
	
});

router.get('/core/user/add', function(req, res) {

    user.add(req.query, function(req, results) {
        log.info(results);
		res.status(200).send(results);
    });
	
});


router.get('/core/bill/add', function(req, res) {

    bill.add(req.query, function(req, results) {
        log.info(results);
		res.status(200).send(results);
    });
	
});

router.get('/core/bill/get', function(req, res) {

    bill.get(req.query, function(req, results) {
        log.info(results);
		res.status(200).send(results);
    });
	
});


router.get('/core/bill/get_one', function(req, res) {

    bill.get_one(req.query, function(req, results) {
        log.info(results);
		res.status(200).send(results);
    });
	
});


router.get('/core/bill/get_my', function(req, res) {

    bill.get_my(req.query, function(req, results) {
        log.info(results);
		res.status(200).send(results);
    });
	
});

router.get('/core/bill/get_my_join', function(req, res) {

    bill.get_my_join(req.query, function(req, results) {
        log.info(results);
		res.status(200).send(results);
    });
	
});



router.get('/core/bill_join/add', function(req, res) {

    bill_join.add(req.query, function(req, results) {
        log.info(results);
		res.status(200).send(results);
    });
	
});

router.get('/core/bill_join/get', function(req, res) {

    bill_join.get(req.query, function(req, results) {
        log.info(results);
		res.status(200).send(results);
    });
	
});



module.exports = router;
