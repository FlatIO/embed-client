module.exports = function (config) {
  var configuration = {
    frameworks: ['mocha'],
    client: {
      mocha: {
        timeout: '30000ms',
        // grep: 'GREP'
      },
    },
    reporters: ['mocha'],
    // Make Karma work with pnpm.
    // See: https://github.com/pnpm/pnpm/issues/720#issuecomment-954120387
    plugins: Object.keys(require('./package').devDependencies).flatMap(packageName => {
      if (!packageName.startsWith('karma-')) return [];
      return [require(packageName)];
    }),
    files: [
      'dist/flat-embed.umd.js',
      'test/unit/*.js',
      'test/integration/lib/*.js',
      'test/integration/*.js',
      {
        pattern: 'test/integration/fixtures/*',
        watched: false,
        served: true,
        included: false,
      },
    ],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeCustom'],
    customLaunchers: {
      ChromeCustom: {
        base: 'ChromeHeadless',
        // base: 'Chrome',
        flags: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
      },
    },
    singleRun: false,
    concurrency: Infinity,
    browserNoActivityTimeout: 60000,
  };

  config.set(configuration);
};
