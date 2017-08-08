/* eslint-env node */
/* eslint no-console: 0 */

const fs = require('fs');
const uglifyJs = require('uglify-js');

// Rollup
const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const hypothetical = require('rollup-plugin-hypothetical');

// Banner
const pkg = require('./package.json');
const name = `${pkg.name} v${pkg.version}`;
const copyright = `(c) ${new Date().getFullYear()} Tutteo Ltd. (Flat)`;
const url = `https://github.com/${pkg.repository}`;
const banner = `/*! ${name} | ${copyright} | ${pkg.license} License | ${url} */`;

// Watch?
const watch = process.argv.indexOf('--watch') > -1;

let building = false, needsRebuild = false;

const build = () => {
  if (building) {
    needsRebuild = true;
    return false;
  }
  building = true;
  needsRebuild = false;

  if (watch) {
    console.log('Watch:', new Date().toString());
  }

  rollup.rollup({
    entry: 'src/embed.js',
    plugins: [
      hypothetical({
        allowRealFiles: true,
        files: {
          './node_modules/core-js/library/modules/es6.object.to-string.js': 'export default null'
        }
      }),
      babel({
        runtimeHelpers: true,
        exclude: 'node_modules/**'
      }),
      resolve({
        jsnext: true,
        main: true,
        browser: true
      }),
      commonjs()
    ]
  })
  .then((bundle) => {
    return bundle.generate({
      banner,
      moduleName: 'Flat.Embed',
      format: 'umd',
      sourceMap: true,
      sourceMapFile: 'dist/embed.js.map'
    })
    .then(({ code, map }) => {
      fs.writeFileSync('dist/embed.js', `${code}\n//# sourceMappingURL=embed.js.map`);
      fs.writeFileSync('dist/embed.js.map', map.toString());
      
      const minified = uglifyJs.minify(code, {
        sourceMap: {
          content: map,
          filename: 'dist/embed.min.js.map'
        },
        output: {
          preamble: banner
        },
        mangle: {
          reserved: ['Embed']
        }
      });

      fs.writeFileSync('dist/embed.min.js', minified.code.replace(/\/\/# sourceMappingURL=\S+/, ''));
      fs.writeFileSync('dist/embed.min.js.map', minified.map);

      console.log('Build done in dist/');
      return minified;
    })
    .catch((error) => {
      console.log(error);
    });
  })
  .then(() => {
    building = false;
    if (needsRebuild) {
      build();
    }
    return true;
  })
  .catch((error) => {
    console.log(error);
  });
};

build();

if (watch) {
  require('chokidar')
    .watch('src')
    .on('change', build);
}
