(function () {
  "use strict";

  var app = angular.module('App.FatModel.Provider', []);

  app.provider('$FatModel', function () {

    var SmallModel = function (options, $rootScope, $timeout) {
      var $scope = $rootScope.$new(true)
        , _options = angular.copy(options);

      var _sendEvent = function (actionName, type) {
        $scope.$emit('FatModel:' + actionName + ':' + type);
      };

      var _action = function (actionName, groupName) {
        var hasGroup = function (groupName) {
          if (Array.isArray(groupName)) {
            for (var i = 0; i < _options.groups.length; i++) {
              if (groupName.indexOf(_options.groups[i]) !== -1) {
                return true;
              }
            }
            return false;
          } else {
            return _options.groups.indexOf(groupName) !== -1;
          }
        };

        if (!groupName || (groupName && hasGroup(groupName))) {
          $timeout(function () {
            _sendEvent(actionName, 'started');
          });

          return _options.promise().then(function () {
            options.success.call(options.success);
            _sendEvent(actionName, 'finished');
          },function () {
            options.error.call(options.error);
            _sendEvent(actionName, 'error');
          });
        }

        return false;
      };

      return {
        $on: angular.bind($scope, $scope.$on),

        fetch: function (groupName) {
          return _action('fetch', groupName);
        },

        refresh: function (groupName) {
          if (_options.refresh) {
            return _action('refresh', groupName);
          }

          return false;
        }
      }
    };

    var $FatModelProvider = {
      options: {
        refresh: true,
        groups: []
      },
      $get: ['$q', '$rootScope', '$timeout', function ($q, $rootScope, $timeout) {

        var $scope = $rootScope.$new(true)
          , modelsCollection = {};

        var _action = function (actionName, groupName) {
          var promisses = [];

          $timeout(function () {
            $scope.$emit('FatModel:' + actionName + ':started');
          });

          for (var i in modelsCollection) {
            var modelFeedback = modelsCollection[i][actionName](groupName);

            if (modelFeedback) {
              promisses.push(modelFeedback);
            }

          }

          $q.all(promisses).then(function() {
            $scope.$emit('FatModel:' + actionName + ':finished');
          });
        };

        var $api = {
          $on: angular.bind($scope, $scope.$on),

          register: function (options) {
            var requiredProperties = ['name', 'api', 'success', 'error'];

            for (var i = 0; i < requiredProperties.length; i++) {
              if (!requiredProperties[i] in options) {
                throw new Error('[FatModel:Register:Error] - Missing property "' + i + '"!');
              }
            }

            var _options = angular.extend($FatModelProvider.options, options);

            return modelsCollection[options.name] = SmallModel(_options, $rootScope, $timeout);
          },

          unRegister: function (name) {
            if (name in modelsCollection) {
              delete modelsCollection[name];

              return true;
            }

            return false;
          },

          getModel: function (name) {
            if (name in modelsCollection) {
              return modelsCollection[name];
            }

            throw new Error('[FatModel:getModel:Error] - Model "' + name + '" does not exist.');
          },

          fetch: function () {
            _action('fetch');
          },

          refresh: function () {
            _action('refresh');
          },

          fetchGroup: function (groupName) {
            _action('fetch', groupName);
          },

          refreshGroup: function (groupName) {
            _action('refresh', groupName);
          }
        };

        return $api;
      }]
    };

    return $FatModelProvider;
  });

})();