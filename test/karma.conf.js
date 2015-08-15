module.exports = function (config) {
  config.set({
    frameworks: ['jasmine'],
    singleRun: true,
    browsers: ['PhantomJS'],
    files: [
      'lib/angular/angular.min.js',
      'lib/angular-mocks/angular-mocks.js',
      '../fatModel/fatModel.js'
    ]
  });
};