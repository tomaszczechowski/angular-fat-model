/**
 * @module $FatModelProvider
 * @name FatModel provider.
 * @file Provider to manage models queue.
 * @author Tomasz Czechowski
 * @version 0.2.0
 * @copyright Copyright (c) 2015
 * @license MIT license.
 * {@link https://github.com/tomaszczechowski/angular-fat-model Angular FatModel}.
 */

(function () {
  "use strict";

  var app = angular.module('FatModelProvider', []);

  /**
   * FatModel provider definition.
   */
  app.provider('$FatModelProvider', function () {

    /**
     * Small model fasade.
     *
     * @name SmallModel.
     * @param {object} Options - object contains model configuration.
     * @param {object} $rootScope - Angular $rootScope object.
     * @param {object} $timeout - Angular $timeout object.
     *
     * @returns {object} - API of model.
     */
    var SmallModelFasade = function (options, $rootScope) {
      var $scope = $rootScope.$new(true)
        , _options = angular.copy(options);

      /**
       * Method is in charge of sending events.
       * It uses $emit method from Angular.
       *
       * @access private.
       * @param {string} actionName - action name: fetch/refresh.
       * @param {type} type - type of event: started/finised/error.
       * @fires FatModel:{actionName}:{type}
       */
      var _sendEvent = function (actionName, type) {
        $scope.$emit('FatModel:' + actionName + ':' + type);
      };

      /**
       * Method is in charge of fetching model.
       * It calls methods "success" or "error" depending on the result of fetching.
       *
       * @access private.
       * @param {string} actionName - action name: fetch/refresh.
       * @param {string|array} group - name of group or array of groups which has to be fetched or refreshed.
       *
       * @returns {boolean|object} - method returns false when model doesn't belong to groups otherwise returns primise.
       */
      var _action = function (actionName, group) {
        /**
         * Method checks whether model belongs to group.
         *
         * @access private.
         * @param {string|array} group - name of group or array of groups which has to be fetched or refreshed.
         *
         * @returns {boolean} - method returns true or false depending on whether model belongs to groups or not.
         */
        var hasGroup = function (group) {
          if (Array.isArray(group)) {
            for (var i = 0; i < group.length; i++) {
              if (_options.groups.indexOf(group[i]) !== -1) {
                return true;
              }
            }
            return false;
          } else {
            return _options.groups.indexOf(group) !== -1;
          }
        };

        if (!group || (group && hasGroup(group))) {
          _sendEvent(actionName, 'started');

          return _options.promise().then(
            function () {
              _options.success.apply(options.success, arguments);
              _sendEvent(actionName, 'finished');
            },

            function () {
              _options.error.apply(options.error, arguments);
              _sendEvent(actionName, 'error');
            }
          );
        }

        return false;
      };

      return {
        $on: angular.bind($scope, $scope.$on),

        fetch: function (group) {
          return _action('fetch', group);
        },

        refresh: function (group) {
          if (_options.refresh) {
            return _action('refresh', group);
          }

          return false;
        }
      }
    };

    var $FatModelProvider = {
      /**
       * Default options parameters.
       */
      options: {
        refresh: true,
        groups: []
      },
      $get: ['$q', '$rootScope', function ($q, $rootScope) {

        var $scope = $rootScope.$new(true)
          , modelsCollection = {};

        /**
         * Method is in charge of fetching models.
         *
         * @access private.
         * @param {string} actionName - action name: fetch/refresh.
         * @param {string|array} group - name of group or array of groups which has to be fetched or refreshed.
         * @fires FatModel:{actionName}:{started|finished}
         */
        var _action = function (actionName, group) {
          var promisses = []
            , groupEventName = false;

          var _sendGroupEvent = function (group, type) {
            if (group) {
              if (Array.isArray(group)) {
                for (var i = 0; i < group.length; i++) {
                  _sendGroupEvent(group[i], type);
                }
              } else {
                $scope.$emit('FatModel:' + actionName + ':' + group + ':' + type);
              }
            }

            return;
          };

          $scope.$emit('FatModel:' + actionName + ':started');

          _sendGroupEvent(group, 'started');

          for (var i in modelsCollection) {
            var modelFeedback = modelsCollection[i][actionName](group);

            if (modelFeedback) {
              promisses.push(modelFeedback);
            }

          }

          $q.all(promisses).then(function() {
            _sendGroupEvent(group, 'finished');

            $scope.$emit('FatModel:' + actionName + ':finished');
          });
        };

        var $api = {
          $on: angular.bind($scope, $scope.$on),

          /**
           * Register model.
           *
           * @param {object} options. Model configuration. Must contain parameteres as: name, api, success, error.
           * @throws Will throw an error in case options does not contain required properties.
           *
           * @returns {object}. Created model.
           */
          register: function (options) {
            var requiredProperties = ['name', 'promise', 'success', 'error'];

            for (var i = 0; i < requiredProperties.length; i++) {
              if (!(requiredProperties[i] in options)) {
                throw new Error('[FatModel:Register:Error] - Missing property "' + requiredProperties[i] + '"!');
              }
            }

            var _options = angular.extend($FatModelProvider.options, options);

            return modelsCollection[options.name] = SmallModelFasade(_options, $rootScope);
          },

          /**
           * Method unregister model from queue.
           *
           * @param {string} name. Name of model.
           *
           * @returns {boolean}. In case model exists in queue returs true otherwise false.
           */
          unRegister: function (name) {
            if (name in modelsCollection) {
              delete modelsCollection[name];

              return true;
            }

            return false;
          },

          /**
           * Method return model from model's queue.
           *
           * @param {string} name. Name of model.
           * @throws Will throw an error in case model doesn't exist in queue.
           *
           * @returns {object}. In case model exists in queue returs true otherwise false.
           */
          getModel: function (name) {
            if (name in modelsCollection) {
              return modelsCollection[name];
            }

            throw new Error('[FatModel:getModel:Error] - Model "' + name + '" does not exist.');
          },

          /**
           * Method starts fetching models from queue.
           */
          fetch: function () {
            _action('fetch');
          },

          /**
           * Method starts refreshing models from queue.
           */
          refresh: function () {
            _action('refresh');
          },

          /**
           * Method starts fetching models which belong into group.
           *
           * @param {string|array} group. Group name or array of groups.
           */
          fetchGroup: function (group) {
            _action('fetch', group);
          },

          /**
           * Method starts refreshing models which belong into group.
           *
           * @param {string|array} group. Group name or array of groups.
           */
          refreshGroup: function (group) {
            _action('refresh', group);
          }
        };

        return $api;
      }]
    };

    return $FatModelProvider;
  });

})();