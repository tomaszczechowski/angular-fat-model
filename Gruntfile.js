/*
 * Angular Fat Model
 * https://github.com/tomaszczechowski/angular-fat-model
 *
 * Copyright (c) 2015 Tomasz Czechowski
 * Licensed under the MIT license.
 */

module.exports = function (grunt) {
  'use strict';

  grunt.loadNpmTasks('grunt-karma');

  grunt.initConfig({
    karma: {
      options: {
        configFile: 'test/karma.conf.js',
      },
      unit: {
        options: {
          files: [
            'lib/angular/angular.min.js',
            'lib/angular-mocks/angular-mocks.js',
            '../fatModel/fatModel.js',
            'specs/*.spec.js'
          ]
        }
      }
    }
  });

  grunt.registerTask('unit', ['karma:unit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['unit']);
};
