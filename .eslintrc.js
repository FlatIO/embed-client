module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  root: true,
  env: {
    es6: true,
    browser: true,
  },
  parserOptions: {
    sourceType: 'module',
  },
  rules: {},
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
      },
    },
  },
};
