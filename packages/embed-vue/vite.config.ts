import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: './tsconfig.json',
    }),
  ],
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['es'],
      fileName: () => 'flat-embed-vue.mjs',
    },
    rollupOptions: {
      external: ['vue', 'flat-embed'],
      output: {
        globals: {
          vue: 'Vue',
          'flat-embed': 'Flat.Embed',
        },
      },
    },
    sourcemap: true,
    minify: 'esbuild',
  },
});
