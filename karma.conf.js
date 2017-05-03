var process = require('process');

module.exports = function(config) {
  var configuration = {
    frameworks: ['mocha'],
    client: {
      mocha: {
        timeout: '30000ms',
        // grep: 'Editor modifications'
      }
    },
    files: [
      'node_modules/jquery/dist/jquery.min.js',
      'dist/embed.js',
      'test/integration/lib/*.js',
      'test/integration/*.js'
    ],
    reporters: ['mocha'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    customLaunchers: {
      Chrome_travis_ci: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },
    singleRun: false,
    concurrency: Infinity,
    browserNoActivityTimeout: 30000
  };

  if (process.env.TRAVIS) {
    configuration.browsers = ['Chrome_travis_ci'];
  }

  config.set(configuration);
};
