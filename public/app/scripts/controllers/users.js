app.controller('UsersCtrl', ['$scope', '$http', '$sce', function($scope, $http, $sce) {
  $scope.users = [];
  $scope.selected = null;

  $http.get('/users/').then(function (result) {
    $scope.users = result.data;
  });

}]);
