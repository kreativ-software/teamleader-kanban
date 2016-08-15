'use strict';

/**
 * @ngdoc function
 * @name app.directive:uiNav
 * @description
 * # uiScroll
 * Directive of the app
 */
angular.module('app')
  .directive('juration', ['$timeout', function($timeout) {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, element, attr, ngModel) {

        function fromJuration(text) {
          if (!text) {return null};
          return window.juration.parse(text || '', { defaultUnit: 'hours' });
        }

        function toJuration(value) {
          if (!value) {
            return '';
          }
          return window.juration.stringify(value, { format: 'micro' });
        }
        ngModel.$parsers.push(fromJuration);
        ngModel.$formatters.push(toJuration);
      }
    };
  }])
  .filter('juration', function() {
  return function(value) {
    if (!value) {
      return '';
    }
    return window.juration.stringify(value, { format: 'micro' });  }
});;
