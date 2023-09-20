# 🤓 Development Instructions

## 👋 Setup

Setup dependencies:

```bash
npm install
```

To run a local development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

Please note that a number of environment variables are required to run the app (see "Environment" below).

## 🏗️ Building

To create a production version of the app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## 🌳 Environment

There are a few environment variables required for the app to function. You can find an overview under `.env.template`. Youʼll need access credentials for Pinata, Tenderly and a Gelato Relay API key for claiming projects. Youʼll also need to set up `PUBLIC_NETWORK`, as described right below. Lastly, you'll need to sign up for a free Coinmarketcap API developer account and populate the `COINMARKETCAP_API_KEY` var.

## 🔗 Chain Config

To run the app, youʼll need to configure the `PUBLIC_NETWORK` environment variable. This should be the chainId of the chain you want to run the app for, and can currently be either 1, 5 or 11155111. The app will only allow connecting wallets that are set to this network, and all server-side requests will be made for this network's subgraph.

For your convenience, weʼve deployed production mirrors of the app set to allow testnet connections:

```sh
https://goerli.drips.network/ # PUBLIC_NETWORK set to 5
https://sepolia.drips.network/ # PUBLIC_NETWORK set to 11155111
```

## 🧪 Tests

Tests are setup with `vitest` as a runner, and `playwright` as the E2E test environment. Components can be unit-tested using `jsdom` (check `$lib/components/example/example.test.ts` for an example). Ensure unit tests follow the name format `*.unit.test.ts`, while E2E tests should be named like `*.e2e.test.ts`.

### Run unit tests

With all dependencies installed, simply run:

```bash
npm run test:unit
```

### E2E tests

#### Running E2E tests

We're using `docker compose` to run a local test environment, including a `ganache` testnet with deployed Drips contracts (and a mock ERC-20), a local graph node with

To get started, make sure you have Docker installed & running, ensure the app's dependencies are installed via NPM, and execute from the root directory of the app:

```bash
npm run e2e
```

This will build a production version of the app, and execute all E2E test suites. Each test suite itself will run `docker compose up` to start the E2E test environment (ipfs node, anvil testnet w/ Drips contracts, and Graph Node w/ Drips subgraph). On first run, youʼll see `Pinging Graph Node…` being logged for an extended amount of time. On subsequent runs, this step will be a lot faster, because much of the E2E Docker environment is being cached.

**Important:** The local testnet is based on a static chain state which is copied into the testnet image from ./src/e2e-tests/docker/testnet/state. When a new version of contracts is released, this state needs to be updated. The subgraph is downloaded at image build time from the latest state of the `drips-subgraph` repo's `v2` branch.

#### Writing E2E tests

##### Starting the E2E test environment

To start the E2E environment (local testnet & graph node with deployed Drips contracts and subgraph), register the following Vitest callbacks on your test suites:

```ts
beforeAll(environment.start, 14400000);
afterAll(environment.stop);
```

This will start the Docker environment before the tests run, and shut it down at the end.

##### Configuring the app for testing

In order to connect the app to the local E2E network during an E2E test, add this `beforeAll` block in your test fixture:

```ts
import configureAppForTest from './helpers/configure-app-for-test';

// …

beforeAll(async () => {
  server = await preview({ preview: { port: 3000 } });
  browser = await chromium.launch();
  page = await browser.newPage();

  // …

  await configureAppForTest(page);
});
```

This utility sets a window variable `isPlaywrightTest` to `true`, causing the app to connect to the local testnet and subgraph.

When starting your E2E test like this, user `0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266` is automatically and immediately connected to the app, and has a balance of 100 TEST.

#### Interacting with the Mock ERC-20

As part of E2E environment setup, a mock ERC-20 token is deployed at `0xefbF81372aBC3723463746a89CEb42080563684C`, and automatically grants address `0x433220a86126eFe2b8C98a723E73eBAd2D0CbaDc` a balance of `100000000000000000000` wei. In order to be able to use this token within the app in your tests, you can append a "custom token" to localstorage, which will be picked up by `tokens.store` upon startup.

Simply run the following in a `page.addInitScript` block:

```js
localStorage.setItem(
  'custom-tokens',
  JSON.stringify([
    {
      source: 'custom',
      banned: false,
      info: {
        chainId: 5,
        address: '0xefbF81372aBC3723463746a89CEb42080563684C',
        name: 'Testcoin',
        decimals: 18,
        symbol: 'TEST',
      },
    },
  ]),
);
```

After doing this, the app will display the token within all token pickers. Alternatively, you can also run through adding the custom token via the UI within your test.

#### `PUBLIC_TEST_MODE` and `playwrightAddress`

Unfortunately, two major differences in app logic for E2E tests couldnʼt be avoided: Firstly, the app uses a mock wallet store that connects to the local testnet instead of the real one, and IPFS access is mocked using localstorage. The logic checks for an env variable `PUBLIC_TEST_MODE` being true. The mock wallet store also checks for `window.playwrightAddress`, and initializes itself to be connected to that address. In order to make use of these adjustments, call `page.addInitScript` and set the two variables.

## 😱 Advanced

### 🌐 Run app locally with a local testnet

It's possible to connect the app running locally to the local E2E test environment described above. This allows simple and quick development locally, as all transactions will resolve instantly, and network requests are a lot faster. To do so, run `npm run dev:local-env:start-env` to up the local development environment, then run `dev:local-env:start-app` to start the dev server and connect it to the local services. Once done, run `npm run dev:local-env:stop-env` to stop the local development environment.
