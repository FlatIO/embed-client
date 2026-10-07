import { defineConfig, minify } from 'vite';
import dts from 'vite-plugin-dts';

/**
 * Vite keeps whitespace and comments in ES library builds. Strip them so the
 * published bundle only contains runtime code (docs live in the .d.ts files).
 * @returns {import('vite').Plugin}
 */
function stripComments() {
  return {
    name: 'strip-comments',
    async renderChunk(code, _chunk, options) {
      if (options.format !== 'es') return null;
      const result = await minify('flat-embed.mjs', code, {
        compress: false,
        mangle: false,
        codegen: { removeWhitespace: true },
        sourcemap: true,
      });
      return { code: result.code, map: result.map };
    },
  };
}

/** @type {import('vite').UserConfig} */
export default defineConfig({
  build: {
    lib: {
      entry: './src/embed.ts',
      formats: ['es', 'umd'],
      name: 'Flat.Embed',
    },
    sourcemap: true,
    rolldownOptions: {
      external: [/^node:.*/],
      output: {
        sourcemapExcludeSources: true,
      },
    },
    target: 'es2022',
  },
  plugins: [dts({ compilerOptions: { rootDir: './src' } }), stripComments()],
});
