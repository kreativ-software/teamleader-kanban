app.controller('KanbanCtrl', ['$rootScope', '$scope', '$http', '$sce', function($rootScope, $scope, $http, $sce) {
  $scope.lists = {};
  $scope.selected = null;

  $scope.backlogCollapse = true;

  $scope.insertedCallback = function (item, listKey, event) {
    item.kanbanKey = listKey;
    $http.post('/tasks/', item);
  };

  $scope.taskClick = function (item) {
    $http.get('/tasks/' + item.id, {})
      .then(function (result) {
        var task = result.data;
        angular.extend(item, item, task);
      });
  };

  $scope.addTimetrack = function (item) {
    item.teamleaderUser = $rootScope.teamleaderUser;
    $http.post('/tasks/tracktime/', item)
      .then(function (result) {
        item.tracktime = 0;
      }, function (err) {
        alert(err);
      });
  };

  $scope.toggleBacklogCollapse = function () {
    $scope.backlogCollapse = !$scope.backlogCollapse;
  };

  $http.get('/tasks/options', {})
    .then(function (result) {
      angular.forEach(result.data.options, function (columnName, key) {
        $scope.lists[columnName] = {
          key: key,
          items: []
        };
      });

      $http.get('/tasks/', {})
        .then(function (result) {
          angular.forEach(result.data, function (task) {
            if (task.kanban) {
              var columnName = task.kanban;
              //task.description_trusted = $sce.trustAsHtml(task.description);
              $scope.lists[columnName].items.push(task);
            }
          });
        });
    });
}]);
