# 🤓 Development Instructions

## 👋 Setup

Install dependencies:

```bash
npm install
```

## 🌳 Environment

There are a few environment variables required for the app to function. You can find an overview under `.env.template`. Youʼll need access credentials for GitHub, Pinata, Tenderly and a Gelato Relay API key for claiming projects. Youʼll also need to set up `PUBLIC_NETWORK`, as described right below. Lastly, you'll need to sign up for a free Coinmarketcap API developer account and populate the `COINMARKETCAP_API_KEY` var. Lastly, set `PUBLIC_PINATA_GATEWAY_URL` to the URL of the IPFS/Pinata gateway to use. You may use Drips' public IPFS gateway at `https://drips.mypinata.cloud`.

### 📈 GraphQL API

The Drips App depends on the custom [Drips GraphQL API](https://github.com/drips-network/graphql-api). You need to set `GQL_URL` to a URL of the API's `graphql` endpoint, and `GQL_ACCESS_TOKEN` for the `Authorization: Bearer` token that should be used.

For most development tasks, you may use our Sepolia deployment of the API, hosted at [https://drips-api-sepolia-s1.up.railway.app/](https://drips-api-sepolia-s1.up.railway.app/). To use this API deployment, set `GQL_URL` to `https://drips-api-sepolia-s1.up.railway.app/`, and `GQL_ACCESS_TOKEN` to `1234`. Ensure `PUBLIC_NETWORK` is set to `11155111`, so that both the app and API are talking to the Sepolia testnet.

You can also use the local E2E env to easily spin up a fully-fledged deployment of the Drips GraphQL API, complete with event processing and a local, blank testnet to transact against. To do so, set `GQL_URL` to `http://localhost:8080/graphql`, `GQL_ACCESS_TOKEN` to `afdb8b7e-8fa7-4de9-bd95-b650b839e745`, and `PUBLIC_NETWORK` to `5`. Then, follow the instructions below under "🌐 Run app locally with a local testnet".

### 🔗 Chain Config

To run the app, youʼll need to configure the `PUBLIC_NETWORK` environment variable. This should be the chainId of the chain you want to run the app for, and can currently be either 1 or 11155111. The app will only allow connecting wallets that are set to this network, and all server-side requests will be made for this network's subgraph.

For your convenience, weʼve deployed production mirrors of the app set to allow testnet connections:

```sh
https://sepolia.drips.network/ # PUBLIC_NETWORK set to 11155111
```

## 👷 Building GraphQL types

Before you run the dev server or build the app, you're going to need to build TypeScript types for GraphQL fragments and queries within the app. These auto-generated files, which are all situated in folders called `__generated__` adjacent to the `.ts` or `.svelte` files that define the GQL operation, are deliberately **not** tracked in Git to ensure the app's GQL types are always up-to-date with the GQL endpoint it is connected to.

To build GraphQL types, ensure you've configured the GraphQL endpoint as described above, and run `npm run build:graphql`. This command scans the entire repo for GQL definitions tagged with `gql`, and generates typings in adjacent `__generated__` folders.

Whenever you make a change to a GraphQL definition, like fragments or queries, ensure to run `npm run build:graphql` to make sure all definitions are valid and the typings are up-to-date.

## 🧑‍💻 Starting the local dev server

Assuming you've fully configured your local environment and built GraphQL types as described above, you can run a local development server as follows:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## 🏗️ Building

To create a production version of the app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## 🧪 Tests

Tests are setup with `vitest` as a runner, and `playwright` as the E2E test environment. Components can be unit-tested using `jsdom` (check `$lib/components/example/example.test.ts` for an example). Ensure unit tests follow the name format `*.unit.test.ts`, while E2E tests should be named like `*.e2e.test.ts`.

### Run unit tests

With all dependencies installed, simply run:

```bash
npm run test:unit
```

### Mock Local Environment & E2E Tests

#### Running the mocked local environment

We provide a docker-compose configuration which runs the following services and components locally:

- A Ganache testnet with the [Drips Protocol contracts](https://github.com/drips-network/contracts) pre-deployed
- [Drips Events Processor](https://github.com/drips-network/events-processor)
- [Drips GraphQL API](https://github.com/drips-network/graphql-api)
- [Drips Subgraph](https://github.com/drips-network/subgraph)
- [Graph Node](https://github.com/graphprotocol/graph-node)
- [IPFS Kubo Node](https://github.com/ipfs/kubo) (For Graph Node)
- [Fake Pinata](https://github.com/drips-network/fake-pinata) (Simple local mock of Pinata API)
- 2 Postgres Databases for Events Processor and Subgraph
- One Redis instance for the app's GitHub API caching

You can start and stop this environment with one command, and easily connect a local dev instance of the app to it. This allows entirely gasless local development on a testnet the state of which you can reset at will.

To get started, run:

```sh
  npm run local-env:start
```

This command starts the local environment and starts logging all component's output to the console. When you run this for the first time, it'll take a while, but Docker will cache all build steps for subsequent usages.

Stop the local environment by running:

```sh
  npm run local-env:stop
```

##### Note on service versions

Docker is configured to always build the Drips Event Processor and Drips GraphQL API images from the latest `main` branch commit. When you run the local env, it will automatically check for newer commits and rebuild the images if necessary. If you want to use a different branch of either of these services, you can customize the branch used by specifying environment variables:

```sh
GQL_API_BRANCH=main EVENTS_PROCESSOR_BRANCH=main 
```

##### Connecting the app to the local mocked env

To start a dev server that has the app talk to the locally-running environment, simply run:

```sh
npm run dev:local-env
```

#### Running E2E tests

To run the E2E test suite, ensure the local mock environment is down, and then simply run:

```sh
npm run e2e
```

This command will start the local mock environment, transfer your local source code of the app into a new container, build the app within it, and run tests.

For debugging tests, it's useful to be able to see what's going on within the Playwright browser. To do so, you can run the tests outside of Docker by simply starting the local mock environment (see "Running the mocked local environment"), and execute tests outside of docker by running `npm run test:e2e`.

In order to make the Playwright browser headful, add `E2E_HEADLESS=0` to your `.env` file.

Please note that data is persisted in the local environment unless you explicitly stop and restart it. You will need to do this in-between test runs, because subsequent tests will fail unless the environment is is its initial state.

#### Writing E2E tests

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

### Redis cache for GitHub API responses

When a project profile is loaded, a project is added to a Splits editor, or a GitHub repo URL is entered into the Project Claim Flow, a request for the repo's details to the GitHub API is made. To avoid excessive requests, the responses can be cached. To enable caching, set the `CACHE_REDIS_CONNECTION_STRING` env variable to a valid Redis connection string.
