## 🤓 Development

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

Please note that two environment variables are required for pinning account metadata to IPFS, according to [.env.template](/.env.template). Without these values populated, creating a new stream might fail. You can sign up for a free Pinata account and populate these values for yourself.

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

### Run E2E tests

#### Setup

The E2E setup spins up a local EVM testnet via `anvil`, deploys `drips-contracts` and a mock ERC-20 contract on it, runs a Graph node, and deploys `drips-subgraph`.

In order to run E2E tests, you need a few requisites:

- A Postgres database running locally at port 5432. The simplest way on Mac OS is to install https://postgresapp.com/ and running it with default settings.
- A local IPFS node at port 8545. The simplest way on Mac OS is to install [IPFS Desktop](https://github.com/ipfs/ipfs-desktop#quick-install-shortcuts) and running it with default settings.
- A Rust dev environment. The simplest way is to run [`rustup`](https://rustup.rs/).

With everything above met, ensure the app's dependencies are installed via NPM, and execute from the root directory of the app:

```bash
npm run setup-e2e
```

This will download all projects required for the E2E env to `/src/e2e-tests/.tmp` and install their dependencies. You only need to run this command once, or after any of the required projects (`drips-contracts`, `graph-node`, `drips-subgraph`) release an update.

Once done, run from the root directory of the app:

```bash
npm run start-e2e-env
```

Keep that terminal window open — if you close it, the local E2E environment will stop. If you ever run into trouble with Anvil or the Graph Node not starting because of orphan processes, you can simply run `./src/e2e-tests/scripts/stop-background-env.sh`.

This script **deletes (if exists) and recreates a database called `node-graph` on your local postgres instance**, spins up a local EVM testnet using `anvil`, deploys all drips contracts and an ERC-20 mock token, launches a local graph node, and deploys the `drips-subgraph`. Note that this will be a lot faster after the first run, as the compiled smart contracts and graph-node will be cached.

Once done, you can start running E2E tests with:

```bash
npm run test:e2e
```

If you want to reset the local testnet and subgraph fully, just open the terminal window in which you ran `start-e2e-env`, and hit enter. The script automatically terminates all running background processes, and you can simply run it again to start fresh.

In order to connect the app to the local E2E network during an E2E test, add this `beforeAll` block in your test fixture:

```ts
beforeAll(async () => {
  await page.addInitScript(`
    window.isPlaywrightTest = true;

    localStorage.setItem('custom-tokens', JSON.stringify([
      {
        "source": "custom",
        "banned": false,
        "info": {
          "chainId": 5,
          "address": "0x9A676e781A523b5d0C0e43731313A708CB607508",
          "name": "Testcoin",
          "decimals": 18,
          "symbol": "TEST"
        }
      }
    ]));
  `);
});
```

This will set a window variable `isPlaywrightTest` to `true`, causing the app to connect to the local testnet and subgraph. After that, we're adding a custom ERC-20 token called TEST to the app config, at address `0x9A676e781A523b5d0C0e43731313A708CB607508` — which is where the mock ERC-20 token is deployed on the local testnet.

When starting your E2E test like this, user `0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266` is automatically and immediately connected to the app, and has a balance of 100 TEST.

#### Note on shared state of E2E env

With our current setup, an E2E test env containing of local testnet and drips contracts is deployed before all E2E tests are executed, and not reset between runs, meaning that all E2E tests share the same local environment state. There is currently one unit test that runs through topping up, creating a stream, switching over to another user, and verifying the incoming stream is there. Other E2E tests that are independent of the top-up balance & streams may be set up to run in parallel (e.g. testing setting up a split), but anything that depends on some token being topped up, or a stream existing, should probably be appended to the existing `top-up-create-stream` fixture. In the future, we may consider writing a function that allows resetting the local testnet from within Playwright.

#### `isPlaywrightTest` and `playwrightAddress`

Unfortunately, two major differences in app logic for E2E tests couldn't be avoided: Firstly, the app uses a mock wallet store that connects to the local testnet instead of the real one, and IPFS access is mocked using localstorage. The logic checks for a variable `window.isPlaywrightTest` being true. The mock wallet store also checks for `window.playwrightAddress`, and initializes itself to be connected to that address. In order to make use of these adjustments, call `page.addInitScript` and set the two variables.

#### Interacting with the Mock ERC-20

As part of E2E environment setup, a mock ERC-20 token is deployed at `0x9A676e781A523b5d0C0e43731313A708CB607508`, and automatically grants address `0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266` a balance of `100000000000000000000` wei. In order to be able to use this token within the app in your tests, you can append a "custom token" to localstorage, which will be picked up by `tokens.store` upon startup.

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
        address: '0x9A676e781A523b5d0C0e43731313A708CB607508',
        name: 'Testcoin',
        decimals: 18,
        symbol: 'TEST',
      },
    },
  ]),
);
```

After doing this, the app will display the token within all token pickers. Alternatively, you can also run through adding the custom token via the UI within your test.

## 😱 Advanced

### 🌐 Run app locally with a local testnet

It's possible to connect the app running locally to the local E2E test environment described above. This allows simple and quick development locally, as all transactions will resolve instantly, and network requests are a lot faster. To do so, simply manually set `window.isPlaywrightTest` to `true`, for example by adding a new `<script>` tag within `app.html`. Before you do this, ensure your local E2E test environment is up & running according to the instructions under E2E Tests → Setup above.
