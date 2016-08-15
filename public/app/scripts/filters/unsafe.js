'use strict';

/* Filters */
// need load the moment.js to use this filter. 
angular.module('app')
  .filter('unsafe', ['$sce', function($sce){
    return function(text) {
      return $sce.trustAsHtml(text);
    };
  }]);


