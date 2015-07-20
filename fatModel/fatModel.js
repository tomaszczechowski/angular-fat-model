(function () {
  "use strict";

  var app = angular.module('App.FatModel.Provider', []);

  app.provider('$FatModel', function () {

    var $FatModelProvider = {
      options: {
        refresh: true,
        groups: []
      },
      $get: ['$q', '$rootScope', function ($q, $rootScope) {

        var $scope = $rootScope.$new(true)
          , smallModelsCollection = {};

        var _action = function (name, groupName) {
          var promisses = [];

          $scope.$emit('FatModel:' + name + ':started');

          for (var i in smallModelsCollection) {
            var modelFeedback = smallModelsCollection[i][name](groupName);

            if (modelFeedback) {
              promisses.push(modelFeedback);
            }
          }

          $q.all(promisses).then(function() {
            $scope.$emit('FatModel:' + name + ':finished');
          });
        };

        var $api = {
          register: function (options) {
            var requiredProperties = ['name', 'api', 'success', 'error'];

            for (var i = 0; i < requiredProperties.length; i++) {
              if (!requiredProperties[i] in options) {
                throw new Error('[FatModel:Register:Error] - Missing property "' + i + '"!');
              }
            }

            return smallModelsCollection[name] = angular.extend($FatModelProvider.options, options);
          },

          unRegister: function (name) {
            if (name in smallModelsCollection) {
              delete smallModelsCollection[name];

              return true;
            }

            return false;
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