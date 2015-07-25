(function () {
  "use strict";

  var app = angular.module('App.FatModel.Provider', []);

  app.provider('$FatModel', function () {

    var SmallModel = function (options, $rootScope) {
      var $scope = $rootScope.$new(true)
      var _options = angular.copy(options);

      var _sendEvent = function (type) {
        $scope.$emit('FatModel:' + _options.name + ':' + actionName + ':' + type);
      };

      var _action = function (actionName, groupName) {
        if (groupName && _options.indexOf(groupName) !== -1) {
          _sendEvent('started');

          return _options.promise().then(function () {
            options.success.call(options.success);
            _sendEvent('finished');
          },function () {
            options.error.call(options.error);
            _sendEvent('error');
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
      $get: ['$q', '$rootScope', function ($q, $rootScope) {

        var $scope = $rootScope.$new(true)
          , smallModelsCollection = {};

        var _action = function (actionName, groupName) {
          var promisses = [];

          $scope.$emit('FatModel:' + actionName + ':started');

          for (var i in smallModelsCollection) {
            var modelFeedback = smallModelsCollection[i][actionName](groupName);

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

            return smallModelsCollection[name] = SmallModel(_options, $q, $rootScope);
          },

          unRegister: function (name) {
            if (name in smallModelsCollection) {
              delete smallModelsCollection[name];

              return true;
            }

            return false;
          },

          getSmallModel: function (name) {
            if (name in smallModelsCollection) {
              return smallModelsCollection[name];
            }

            throw new Error('[FatModel:getSmallModel:Error] - Model "' + name + '" does not exist.');
          }
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