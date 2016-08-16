var express = require('express');
var _ = require('underscore');

var TeamLeader = require('teamleader-api');

var router = express.Router();


var tl = new TeamLeader({
  group: process.env.API_GROUP,
  api_secret: process.env.API_KEY
});

/* GET users listing. */
router.get('/current', function(req, res, next) {
  res.send(req.user);
});

router.get('/', function(req, res, next) {

  tl.getUsers({
    show_inactive_users: 1
  }).then(function (result) {
    var teamleaderUser = _.findWhere(result, {email: req.user.email});
    req.session.teamleaderUser = teamleaderUser;
    req.session.save();
    res.send(result);
  });

  //res.send('respond with a resource');

});

module.exports = router;
