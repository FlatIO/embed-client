import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

/** @type {import('vite').UserConfig} */
export default defineConfig({
  build: {
    lib: {
      entry: './src/embed.ts',
      formats: ['es', 'umd'],
      name: 'Flat.Embed',
    },
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      external: [/^node:.*/],
    },
    target: 'es2015',
  },
  plugins: [dts()],
});
