# Testing Flat Embed Client

**Table of content**

<!-- Note for contributors: please use the GitHub preset for the TOC Generator -->

<!-- TOC start (generated with https://github.com/derlin/bitdowntoc) -->

- [Run the tests](#run-the-tests)
- [Run specific test with TEST_GREP](#run-specific-test-with-test_grep)
- [Use local WebApp to run the test](#use-local-webapp-to-run-the-test)
  - [Step 1: Create a testing account](#step-1-create-a-testing-account)
  - [Step 2: Create an app in your local account](#step-2-create-an-app-in-your-local-account)
  - [Step 3: Create some testing score](#step-3-create-some-testing-score)
    - [Create a public score](#create-a-public-score)
    - [Create a private score](#create-a-private-score)
    - [Create a quartet score](#create-a-quartet-score)
  - [Step 4: Setup the `.env` file](#step-4-setup-the-env-file)
  - [You can know run the tests as usual](#you-can-know-run-the-tests-as-usual)

<!-- TOC end -->

## Run the tests

```bash
pnpm test
```

## Run specific test with TEST_GREP

You can run specific test by using the `TEST_GREP` environment variable.

For example, the instruction below will run tests that contain `should pass` in their names:

```bash
TEST_GREP='should pass' pnpm test
```

## Use local WebApp to run the test

### Follow the guide

For Flat developers, a private guide is available here: [Embed Client ~ Setup local tests](https://www.notion.so/tutteo/Embed-Client-Setup-local-tests-9c87cf274ac44a2b85122e8aa2b7cfac)
