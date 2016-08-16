app.controller('UsersCtrl', ['$rootScope', '$scope', '$http', '$sce', function($rootScope, $scope, $http, $sce) {
  $scope.users = [];
  $scope.selected = null;

  $http.get('/users/').then(function (result) {
    $scope.users = result.data;
  });

  $http.get('/users/current').then(function (result) {
    $scope.selected = result.data;
  });

  var setTeamleaderUser = function () {
    if (!$scope.selected) {
      return false;
    }
    $scope.users.forEach(function (user) {
      if (user.email === $scope.selected.email) {
        $rootScope.teamleaderUser = user;
      }
    });
  };

  $scope.$watch('users', setTeamleaderUser);
  $scope.$watch('selected', setTeamleaderUser);

}]);
