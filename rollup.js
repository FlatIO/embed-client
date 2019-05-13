/* eslint-env node */
/* eslint no-console: 0 */

const fs = require('fs');
const uglifyJs = require('uglify-js');

// Rollup
const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

// Banner
const pkg = require('./package.json');
const name = `${pkg.name} v${pkg.version}`;
const copyright = `(c) ${new Date().getFullYear()} Tutteo Ltd. (Flat)`;
const url = `https://github.com/${pkg.repository}`;
const banner = `/*! ${name} | ${copyright} | ${pkg.license} License | ${url} */`;

// Watch?
const watch = process.argv.includes('--watch') || !!process.env.BUILD_WATCH;

let building = false;
let needsRebuild = false;

const build = async () => {
  if (building) {
    needsRebuild = true;
    return false;
  }
  building = true;
  needsRebuild = false;

  if (watch) {
    console.log('Watch:', new Date().toString());
  }

  const bundle = await rollup.rollup({
    input: 'src/embed.js',
    plugins: [
      babel({
        runtimeHelpers: true,
        exclude: 'node_modules/**'
      }),
      resolve({
        mainFields: 'jsnext:main:browser',
      }),
      commonjs()
    ]
  });

  let { output } = await bundle.generate({
    banner,
    name: 'Flat.Embed',
    format: 'umd',
    sourcemap: true,
    sourcemapFile: 'dist/embed.js.map'
  });
  let [{ code, map }] = output;

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

  fs.writeFileSync('dist/embed.min.js', minified.code);
  fs.writeFileSync('dist/embed.min.js.map', minified.map);

  console.log('Build done in dist/');

  building = false;
  if (needsRebuild) {
    build();
  }
};

build();

if (watch) {
  require('chokidar')
    .watch('src')
    .on('change', build);
}
