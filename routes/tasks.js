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
    var tasks = result.map(function (task) {
      task.kanban = task['cf_value_' + process.env.KANBAN_CF_ID];
      delete task['cf_value_' + process.env.KANBAN_CF_ID];
      return task;
    });
    res.send(tasks);
  }).catch (function (err) {
    res.status(500, err);
  });
});

router.post('/', function (req, res, next) {
  var task = req.body;

  var cf_kanban = 'custom_field_' + process.env.KANBAN_CF_ID;
  var options = {
    task_id: task.id
  };
  options[cf_kanban] = task.kanbanKey;

  tl.updateTask(options).then (function (result) {
    res.send(result);
  }, function (err) {
    res.status(500, err);
  });

});

module.exports = router;
