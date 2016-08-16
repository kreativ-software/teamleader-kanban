var express = require('express');
var Q = require('q');
var _ = require('underscore');
var TeamLeader = require('teamleader-api');
var moment = require('moment');

var router = express.Router();

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

router.post('/tracktime', function(req, res, next) {

  var start = moment().startOf('day').format('DD/MM/YYYY');
  var end = moment().endOf('day').format('DD/MM/YYYY');
  var task_id = req.body.id;
  var project_id = req.body.milestone.project.id;
  var milestone_id = req.body.milestone.id;
  var timeTrackInSeconds = req.body.tracktime;
  var teamleaderUser = req.body.teamleaderUser;

  tl.getTimetracking({
    date_from: start,
    date_to: end,
    user_id: teamleaderUser.id
  }).then (function (timetrackings) {
    var startDT = moment().startOf('day').add(9, 'hours');
    if (timetrackings && timetrackings.length > 0) {
      startDT = moment(timetrackings[timetrackings.length-1].date*1000);
    }
    var endDT = startDT.clone().add(timeTrackInSeconds, 'seconds');

    var timetrackingOptions = {
      'for': 'project_milestone',
      for_id: milestone_id,
      description: 'Ontwikkeling',
      start_date: startDT.unix(),
      end_date: endDT.unix(),
      worker_id: teamleaderUser.id,
      task_type_id: 27864
    };
    tl.addTimetracking(timetrackingOptions).then (function (result) {
      res.send({success: true, result: result});
    }, function (err) {
      res.send({success: false, err: err});
    });
  });

  // tl.getTask({
  //   task_id: req.params.id
  // }).then (function (result) {
  //   res.send(result);
  // }).catch (function (err) {
  //   res.status(500, err);
  // });
});

router.get('/:id', function(req, res, next) {
  tl.getTask({
    task_id: req.params.id
  }).then (function (result) {
    res.send(result);
  }).catch (function (err) {
    res.status(500, err);
  });
});

router.get('/', function(req, res, next) {
  // tl.getProjects({
  //   amount: 100,
  //   pageno: 0,
  //   show_active_only: 1
  // }).then(function (projects) {
  //   var milestoneGetters = _.map(projects, function (project) {
  //     return tl.getMilestonesByProject({
  //       project_id: project.id,
  //       include_details: 1
  //     });
  //   });
  //   return Q.all(milestoneGetters);
  // }).then(function (milestonesArray) {
  //   var milestones = _.flatten(milestonesArray);
  //
  //   var now = new Date().getTime()
  //   var taskGetters = _.compact(_.map(milestones, function (milestone) {
  //     if (milestone.closed == 0) {
  //       return tl.getTasksByMilestone({
  //         milestone_id: milestone.id,
  //         selected_customfields: process.env.KANBAN_CF_ID
  //       });
  //     }
  //   }));
  //   return Q.all(taskGetters);
  // }).then (function (tasksArray) {
  //   var tasks = _.flatten(tasksArray);
  //   var taskDetailGetters = _.map(tasks, function (task) {
  //     return tl.getTask({
  //       task_id: task.id
  //     });
  //   });
  //   return Q.all(taskDetailGetters);
  // }).then (function (tasks) {
  //   debugger;
  // });

  var projectsQ = tl.getProjects({
    amount: 100,
    pageno: 0,
    show_active_only: 1
  });
  var milestonesQ = null;

  projectsQ.then(function (projects) {
    var milestoneGetters = _.map(projects, function (project) {
      return tl.getMilestonesByProject({
        project_id: project.id,
        include_details: 1
      });
    });

    milestonesQ = Q.all(milestoneGetters);
    return milestonesQ;
  }).then(function (milestonesArray) {

    Q.all([
      tl.getTasks({
        amount: 100,
        pageno: 0,
        selected_customfields: process.env.KANBAN_CF_ID
      }),
      tl.getTasks({
        amount: 100,
        pageno: 1,
        selected_customfields: process.env.KANBAN_CF_ID
      }),
      tl.getTasks({
        amount: 100,
        pageno: 2,
        selected_customfields: process.env.KANBAN_CF_ID
      })//,
      // tl.getTasks({
      //   amount: 100,
      //   pageno: 3,
      //   selected_customfields: process.env.KANBAN_CF_ID
      // })
    ]).then (function (tasksArray) {
      var projects = projectsQ.inspect().value;
      var milestonesArray = milestonesQ.inspect().value;
      _.each(milestonesArray, function (milestones, idx) {
        _.each(milestones, function (milestone) {
          milestone.project = projects[idx];
        });
      });

      var milestones = _.flatten(milestonesArray);
      milestones = _.where(milestones, {
        closed: 0
      });

      var tasks = _.flatten(tasksArray);
      tasks = _.compact(_.map(tasks, function (task) {
        task.milestone = _.findWhere(milestones, {id: task.milestone_id})
        task.kanban = task['cf_value_' + process.env.KANBAN_CF_ID] || 'Backlog';
        delete task['cf_value_' + process.env.KANBAN_CF_ID];
        if (task.milestone) {
          return task;
        }
        return false;
      }));
      res.send(tasks);
    }).catch (function (err) {
      res.status(500, err);
    });
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
