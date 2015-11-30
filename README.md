# Angular-fat-model

Fat model is used to better coordinate models in application. Allows to aggregate then in groups in order to fetch only groups which are currently needed.

## Getting Started
This plugin was tested on Angular in version 1.3.x, 1.4.x and 1.5.x

## Instalation

```shell
bower install angular-fat-model --save-dev
```
Add lib into script

```html
<script type="text/javascript" src="../bower_components/angular/angular.js"></script>
```

```javascript
(function () {
  "use strict";

  var app = angular.module('App', ['FatModelProvider']);

  app.run([
    '$FatModelProvider',
    '$timeout',
    '$q',
    '$http',
    function ($FatModelProvider, $timeout, $q, $http) {
      // Method just only for demo
      var fetch = function () {
        var defer = $q.defer();

        $http({
          method: 'GET',
          url: 'http://localhost',
          withCredentials: true
        }).success(function () {
          defer.resolve.apply(defer.resolve, arguments);
        }).error(function () {
          defer.reject.apply(defer.reject, arguments);
        });

        return defer.promise;
      };

      $FatModelProvider.register({
        name: 'model-1',
        promise: fetch,
        refresh: true,
        groups: ['group-1'],
        success: function () {
          console.log('success 1');
        },
        error: function () {
          console.log('error 1');
        }
      });

      $FatModelProvider.register({
        name: 'model-2',
        promise: fetch,
        refresh: true,
        groups: ['group-1'],
        success: function () {
          console.log('success 1');
        },
        error: function () {
          console.log('error 1');
        }
      });

      $FatModelProvider.register({
        name: 'model-3',
        promise: fetch,
        refresh: true,
        groups: ['other-group'],
        success: function () {
          console.log('success 1');
        },
        error: function () {
          console.log('error 1');
        }
      });

      $FatModelProvider.$on('FatModel:fetch:started', function () {
        console.log('Started fetching');
      });

      $FatModelProvider.$on('FatModel:fetch:finished', function () {
        console.log('Finished fetching - Do something when all models have been fetched!');
      });

      $FatModelProvider.getModel('model-1').$on('FatModel:fetch:started', function () {
        console.log('Started fetching model-1');
      });

      $FatModelProvider.getModel('model-2').$on('FatModel:fetch:finished', function () {
        console.log('Finished fetching model-1');
      });

      $FatModelProvider.$on('FatModel:fetch:main:started', function () {
        console.log('Started fetching group main');
      });

      $FatModelProvider.$on('FatModel:fetch:main:finished', function () {
        console.log('Finished fetching group main');
      });

      $FatModelProvider.fetch().then(function (response) {
        console.log('All fetch response:', response);
      });

      // OR

      $FatModelProvider.fetchGroup(['other']).then(function (response) {
        console.log('Group fetch response:', response);
      });

      // OR

      $FatModelProvider.getModel('model-1').fetch().then(function (response) {
        console.log('Model-1 response:', response);
      });
  ]);
})();
```
### Options


## Release History
 * 2015-11-21   v0.4.0   Removed success and error callbacks. Returns promise on fetch and fetchGroup call.
 * 2015-11-21   v0.3.0   Added success and error callbacks.
 * 2015-11-21   v0.2.2   Updated bower and package files on new keywords.
 * 2015-11-05   v0.2.1   Removed timeouts.
 * 2015-10-30   v0.2.0   Triggers events for groups.
 * 2015-09-28   v0.1.0   First version of plugin.

---

Task submitted by [Tomasz Czechowski](http://czechowski.pl/)
