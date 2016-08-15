var express = require('express');

var TeamLeader = require('teamleader-api');

var router = express.Router();


var tl = new TeamLeader({
  group: process.env.API_GROUP,
  api_secret: process.env.API_KEY
});

/* GET users listing. */
router.get('/', function(req, res, next) {

  tl.getUsers({
    show_inactive_users: 1
  }).then(function (result) {
    res.send(result);
  });
  
  //res.send('respond with a resource');

});

module.exports = router;
