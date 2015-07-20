(function () {
  "use strict";

  var app = angular.module('App.FatModel.Service', []);

  app.service('FatModelService', ['$rootScope', '$q', function ($rootScope, $q) {
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

    var api = {
      register: function (name, SmallModel) {
        if ('fetch' in SmallModel && 'refresh' in SmallModel) {
          return smallModelsCollection[name] = SmallModel;
        }

        throw new Error('[FatModel:Error] - Small model needs to have implemented "fetch" and "refresh" method!');
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

    angular.extend(this, api);
  }]);
})();