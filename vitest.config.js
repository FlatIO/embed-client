import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const testEnv = {
  FLAT_EMBED_APP_ID: process.env.FLAT_EMBED_APP_ID,
  FLAT_EMBED_BASE_URL: process.env.FLAT_EMBED_BASE_URL,
  FLAT_EMBED_PUBLIC_SCORE: process.env.FLAT_EMBED_PUBLIC_SCORE,
  FLAT_EMBED_QUARTET_SCORE: process.env.FLAT_EMBED_QUARTET_SCORE,
  FLAT_EMBED_PRIVATE_LINK_SCORE: process.env.FLAT_EMBED_PRIVATE_LINK_SCORE,
  FLAT_EMBED_PRIVATE_LINK_SHARING_KEY: process.env.FLAT_EMBED_PRIVATE_LINK_SHARING_KEY,
  FLAT_EMBED_NEW_DISPLAY: process.env.FLAT_EMBED_NEW_DISPLAY,
};

export default defineConfig({
  define: {
    __TEST_ENV__: JSON.stringify(testEnv),
  },
  test: {
    setupFiles: ['test/setup.js'],
    include: ['test/unit/*.js', 'test/integration/*.js'],
    exclude: ['test/manual/**', 'test/integration/fixtures/**', 'test/integration/lib/**'],
    globals: true,
    testTimeout: 30000,
    hookTimeout: 30000,
    testNamePattern: process.env.TEST_GREP,
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
