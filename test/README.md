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

**Note 1:** For the following steps we assume your local environment is setup as `https://flat.ovh:3000`.

**Note 2:** In the future we need to create a script that automatically handle step 1, 2 and 3.

### Step 1: Create a testing account

We recommend to create a dedicated account for `embed-client` testing. For example `your-usual-email+embed-client@domain.com`.

1. Go to `https://flat.ovh:3000/auth/signup` to create your account.

### Step 2: Create an app in your local account

1. Go to `https://flat.ovh:3000/developers/apps`
2. Create an app (example: `Testing App`)
3. You'll find your `APP_ID` in the **Embed > Overview** section

### Step 3: Create some testing score

In order to properly run the tests you'll have to create three scores on your account. All the scores must be created by importing the fixtures available in `/test/integration/fixtures/` of the `embed-client` repository.

Go to your library: `https://flat.ovh:3000/my-library`.

#### Create a public score

1. Import the fixture `flat-house-of-the-rising-sun.mxl`
2. Make the score public
3. Extract the id from the score url, it will be your `PUBLIC_SCORE_ID` for step 4.

#### Create a private score

1. Import the fixture `flat-house-of-the-rising-sun.mxl`
2. Rename the score to `House of the Rising Sun (Private link test Embed)`.
3. Extract the id from the score url, it will be your `PRIVATE_SCORE_ID` for step 4.
4. Create a sharing key by creating a private shareable link. It will be your `SHARING_KEY` for step 4.

#### Create a quartet score

1. Import the fixture `4-parts.mxl`
2. Make the score public
3. Extract the id from the score url, it will be your `QUARTET_SCORE_ID` for step 4.

### Step 4: Setup the `.env` file

By default, the tests are run with the production WebApp. You can override this behavior by creating a `.env` file with a similar config as below:

```bash
# .env file
FLAT_EMBED_APP_ID='APP_ID' # id of the previously created app
FLAT_EMBED_BASE_URL='https://flat.ovh:3000/embed' # path to your local embed WebApp
FLAT_EMBED_PUBLIC_SCORE='PUBLIC_SCORE_ID' # id of your previously create public score
FLAT_EMBED_PRIVATE_LINK_SCORE='PRIVATE_SCORE_ID' # id of the previously created private score
FLAT_EMBED_PRIVATE_LINK_SHARING_KEY='SHARING_KEY' # sharing key of the previously created private score
FLAT_EMBED_QUARTET_SCORE='QUARTET_SCORE_ID' # id of your previously created quartet score
```

### You can know run the tests as usual

```bash
pnpm test
```
