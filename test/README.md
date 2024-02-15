# Testing Flat Embed Client

**Table of content**

<!-- Note for contributors: please use the GitHub preset for the TOC Generator -->

<!-- TOC start (generated with https://github.com/derlin/bitdowntoc) -->

- [Run specific test with TEST_GREP](#run-specific-test-with-test_grep)
- [Use local WebApp to run the test](#use-local-webapp-to-run-the-test)
   * [Step 1: Create an app in your local account](#step-1-create-an-app-in-your-local-account)
   * [Step 2: Create some testing score](#step-2-create-some-testing-score)
      + [Create a public score](#create-a-public-score)
      + [Create a private score](#create-a-private-score)
      + [Create a quarted score](#create-a-quarted-score)
   * [Step 3: Setup the `.env` file](#step-3-setup-the-env-file)

<!-- TOC end -->

## Run specific test with TEST_GREP

You can run specific test by using the `TEST_GREP` environment variable.

For example, the instruction below will run tests that contain `should pass` in their names:

```bash
TEST_GREP='should pass' pnpm test
```

## Use local WebApp to run the test

**Note:** In the future we need to create a script that automatically handle step 1 and 2

### Step 1: Create an app in your local account

### Step 2: Create some testing score

In order to properly run the tests you'll have to create three scores on your account. All the scores must be created by importing the fixture available in `/test/integration/fixtures/` of the `embed-client` repository.

#### Create a public score

#### Create a private score


#### Create a quarted score

### Step 3: Setup the `.env` file

By default, the tests are run with the production WebApp. You can override this behavior by creating a `.env` file with a similar config as below:

```bash
# .env file
FLAT_EMBED_APP_ID='APP_ID' # id of the previously created app
FLAT_EMBED_BASE_URL='https://flat.ovh:3000/embed' # path to your local embed WebApp
FLAT_EMBED_PUBLIC_SCORE='PUBLIC_SCORE_ID' # id of your previously create public score
FLAT_EMBED_PRIVATE_LINK_SCORE='PRIVATE_SCORE_ID' # id of the previously created private score
FLAT_EMBED_PRIVATE_LINK_SHARING_KEY='SHARING_KEY' # sharing key of the previously created private score
```
