import 'dotenv/config';
import vue from '@vitejs/plugin-vue';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const testEnv = {
  FLAT_EMBED_APP_ID: process.env.FLAT_EMBED_APP_ID,
  FLAT_EMBED_BASE_URL: process.env.FLAT_EMBED_BASE_URL,
  FLAT_EMBED_PUBLIC_SCORE: process.env.FLAT_EMBED_PUBLIC_SCORE,
  FLAT_EMBED_QUARTET_SCORE: process.env.FLAT_EMBED_QUARTET_SCORE,
  FLAT_EMBED_PRIVATE_LINK_SCORE: process.env.FLAT_EMBED_PRIVATE_LINK_SCORE,
  FLAT_EMBED_PRIVATE_LINK_SHARING_KEY: process.env.FLAT_EMBED_PRIVATE_LINK_SHARING_KEY,
};

export default defineConfig({
  plugins: [vue()],
  define: {
    __TEST_ENV__: JSON.stringify(testEnv),
  },
  test: {
    include: ['test/**/*.test.ts'],
    globals: true,
    testTimeout: 30000,
    hookTimeout: 30000,
    dangerouslyIgnoreUnhandledErrors: true,
    browser: {
      enabled: true,
      provider: playwright({
        launchOptions: {
          args: ['--autoplay-policy=no-user-gesture-required'],
        },
      }),
      instances: [
        {
          browser: 'chromium',
        },
      ],
    },
  },
});
