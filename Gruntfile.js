/*
 * Angular Fat Model
 * https://github.com/tomaszczechowski/angular-fat-model
 *
 * Copyright (c) 2015 Tomasz Czechowski
 * Licensed under the MIT license.
 *
 */

module.exports = function (grunt) {
  'use strict';

  grunt.loadNpmTasks('grunt-karma');

  grunt.initConfig({
    karma: {
      options: {
        configFile: 'test/karma.conf.js'
      },
      unit: {
        options: {
          files: [
            '**/*.spec.js'
          ]
        }
      }
    }
  });
  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('unit', ['karma:unit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['unit']);
};
