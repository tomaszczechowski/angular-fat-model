/**
 * @module $FatModelProvider
 * @name FatModel provider.
 * @file Provider to manage models queue.
 * @author Tomasz Czechowski
 * @version 0.4.2
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
     * @param {object} options - object contains model configuration.
     * @param {object} $q - Angular $q object.
     * @param {object} $rootScope - Angular $rootScope object.
     *
     * @returns {object} - API of model.
     */
    var SmallModelFasade = function (options, $q, $rootScope) {
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

          var deferrer = $q.defer();

          _options.promise().then(
            function () {
              _options.success.apply(_options.success, arguments);
              _sendEvent(actionName, 'finished');

              var response = {
                name: _options.name,
                data: arguments[0] || null,
                args: arguments
              };

              deferrer.resolve(response);
            },

            function (error) {
              _options.error.apply(_options.error, arguments);
              _sendEvent(actionName, 'error');

              deferrer.reject(error);
            }
          );

          return deferrer.promise;
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
      status: false,
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
          var promisses = [];

          var _sendGroupEvent = function (group, type, data) {
            if (group) {
              if (Array.isArray(group)) {
                for (var i = 0; i < group.length; i++) {
                  _sendGroupEvent(group[i], type);
                }
              } else {
                $scope.$emit('FatModel:' + actionName + ':' + group + ':' + type, data);
              }
            }

            return
          };

          $FatModelProvider.status = 'pending';

          $scope.$emit('FatModel:' + actionName + ':started');

          _sendGroupEvent(group, 'started', null);

          for (var i in modelsCollection) {
            var modelFeedback = modelsCollection[i][actionName](group);

            if (modelFeedback) {
              promisses.push(modelFeedback);
            }

          }

          return $q.all(promisses).then(function() {
            $FatModelProvider.status = 'ready';

            _sendGroupEvent(group, 'finished', null);

            $scope.$emit('FatModel:' + actionName + ':finished');

            return arguments[0];
          }, function (error) {
            $FatModelProvider.status = 'error';

            _sendGroupEvent(group, 'error', null);

            $scope.$emit('FatModel:' + actionName + ':error', error);

            return error;
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

            return modelsCollection[options.name] = SmallModelFasade(_options, $q, $rootScope);
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
            return _action('fetch', null);
          },

          /**
           * Method starts refreshing models from queue.
           */
          refresh: function () {
            return _action('refresh', null);
          },

          /**
           * Method starts fetching models which belong into group.
           *
           * @param {string|array} group. Group name or array of groups.
           */
          fetchGroup: function (group) {
            return _action('fetch', group);
          },

          /**
           * Method starts refreshing models which belong into group.
           *
           * @param {string|array} group. Group name or array of groups.
           */
          refreshGroup: function (group) {
            return _action('refresh', group);
          },

          /**
           * Method checks whether Fat Model finished fetching registered models.
           * @return {Boolean}
           */
          isReady: function () {
            return $FatModelProvider.status === 'ready';
          },

          /**
           * Method checks whether Fat Model is still being in progress.
           * @return {Boolean}
           */
          isPending: function () {
            return $FatModelProvider.status === 'pending';
          },

          /**
           * Method checks whether Fat Model was ran with errors.
           * @return {Boolean}
           */
          isError: function () {
            return $FatModelProvider.status === 'error';
          }
        };

        return $api;
      }]
    };

    return $FatModelProvider;
  });

})();