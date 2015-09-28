# Angular-fat-model

[![Build Status][angular-fat-model-ci-image]][angular-fat-model-ci-url]

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
        groups: ['main'],
        success: function () {
          console.log('success 1');
        },
        error: function () {
          console.log('error 1');
        }
      });

      $timeout(function () {
        $FatModelProvider.fetchGroup(['main']);

        $FatModelProvider.$on('FatModel:fetch:started', function () {
          console.log('Started fetching');
        });

        $FatModelProvider.$on('FatModel:fetch:finished', function () {
          console.log('Finished fetching');
        });

        $FatModelProvider.getModel('model-1').$on('FatModel:fetch:started', function () {
          console.log('Started fetching model-1');
        });

        $FatModelProvider.getModel('model-1').$on('FatModel:fetch:finished', function () {
          console.log('Finished fetching model-1');
      });
    });
  ]);
})();
```
### Options


## Release History
 * 2015-09-28   v0.1.0   First version of plugin.

---

Task submitted by [Tomasz Czechowski](http://czechowski.pl/)

[angular-fat-model-ci-image]: https://secure.travis-ci.org/tomaszczechowski/angular-fat-model.png?branch=master
[angular-fat-model-ci-url]: http://travis-ci.org/tomaszczechowski/angular-fat-model
