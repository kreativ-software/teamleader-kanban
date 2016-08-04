var express = require('express');
var router = express.Router();
var TeamLeader = require('teamleader-api');

var tl = new TeamLeader({
  group: process.env.API_GROUP,
  api_secret: process.env.API_KEY
});

/* GET users listing. */
router.get('/options', function(req, res, next) {
  tl.getCustomFieldInfo({
    custom_field_id: process.env.KANBAN_CF_ID
  }).then (function (result) {
    res.send(result);
  }).catch (function (err) {
    res.status(500, err);
  });
});

router.get('/', function(req, res, next) {
  tl.getTasks({
    amount: 100,
    pageno: 0,
    selected_customfields: process.env.KANBAN_CF_ID
  }).then (function (result) {
    res.send(result);
  }).catch (function (err) {
    res.status(500, err);
  });
});

module.exports = router;
