var process = require('process');

module.exports = function(config) {
  var configuration = {
    frameworks: ['mocha'],
    client: {
      mocha: {
        timeout: '30000ms',
        // grep: 'GREP'
      }
    },
    files: [
      'node_modules/jquery/dist/jquery.min.js',
      'dist/embed.js',
      'test/unit/*.js',
      'test/integration/lib/*.js',
      'test/integration/*.js',
    ],
    reporters: ['mocha'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeNoGPU'],
    customLaunchers: {
      ChromeNoGPU: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
      },
    },
    singleRun: false,
    concurrency: Infinity,
    browserNoActivityTimeout: 60000
  };

  if (process.env.TRAVIS) {
    configuration.customLaunchers.ChromeNoGPU.flags.push('--disable-gpu');
  }

  config.set(configuration);
};
