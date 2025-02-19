# 🤓 Development Instructions

The stack for the Drips App contains a number of services, which can all be run entirely locally for development. For this, we use `docker compose`. 

## 🚀 Quick Start

First, run `npm i` to install dependencies.

To run a local dev environment, simply run `npm run dev:docker`. This will start all necessary services for running the Drips app locally, complete with a local testnet that has the Drips protocol contracts and a test ERC-20 deployed. After this, set up MetaMask for the local testnet by following the instructions below.

No values in `.env` should be required for running the local dev stack, however setting `GITHUB_PERSONAL_ACCESS_TOKEN` is strongly recommended. Without it, the app will be heavily rate-limited by the GitHub API, and loading project data may fail.

### 🪟 Running on Windows

To run the stack on Windows, [use WSL2 in order to get a UNIX shell](https://learn.microsoft.com/en-us/windows/wsl/install). Make sure Docker is installed on your WSL distribution. The easiest way is to download Docker Desktop for Windows, configure it to use the WSL backend, and make sure to enable the WSL integration for your distro of choice in Docker Desktop -> Resources -> WSL integration -> Enable integration with additional distros. After that, you can use the Docker local environment as described above.

### 🦊 Using MetaMask with the local testnet

Usage of MetaMask is recommended for development. After starting the app with `npm run dev:docker`, click "Connect" and it should automatically prompt you to add the local testnet to MetaMask.

After this, create a new account and import the private key `ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`. This account has a large amount of testnet ETH available, as well as 1000 TEST tokens that you can use with Drips.

### 🚮 Clearing the local environment

Data of stateful services (and the testnet) is generally automatically persisted. To clear everything and start from scratch, run `npm run dev:docker:clear`.

### 🤓 Dev mode

Head to Settings within the app and enable "Developer mode" to display helpful "Development" sections on screens like the Project Profile, Drip Lists, Streams etc.

### 🌳 Running the staging branch of services

If you need to develop with unreleased features of one more other services, you can set the tag to use for a particular service by passing an environment variable to the `dev:docker` command. Most services will build images for `main` and `staging` branches, by default the `main` tag is used.

To switch to staging images, pass one or more of the following env vars:
- `MULTIPLAYER_TAG=staging`
- `EVENT_PROCESSOR_TAG=staging`
- `GRAPHQL_API_TAG=staging`

e.g. `MULTIPLAYER_TAG=staging EVENT_PROCESSOR_TAG=staging GRAPHQL_API_TAG=staging npm run dev:docker`

### 🥸 Claiming a project using the fake oracle

Drips uses an on-chain oracle service to validate ownership of repositories by looking up a `FUNDING.json` file on the repo's default branch. On the local development testnet, a fake oracle that can be used to fake the contents of this file is available.

To claim a project during local dev mode:
- If you haven't already, enable "Developer mode" in the app settings.
- Navigate to the project page of a repo you want to claim by pasting its GitHub URL into the app's search bar
- Copy the project's Account ID.
- Begin the claiming process, which will prompt you to add the FUNDING.json file with an entry for "localtestnet" to the repository.
- After confirming the claim process, the app will prompt you to send a transaction to request an owner update on-chain. Sign and submit this transaction.
- Right after, run `npm run dev:docker:update-repo-owner`. You will be prompted to submit the account ID of the project you want to claim, and the address that should be set as its owner. Enter the address you previously configured in `FUNDING.json` for `localtestnet`.
- Submit, and the fake oracle will update the owner of the project to the address you specified. The claim flow will continue.

## 🥸 Inspecting databases with PGAdmin

The docker-compose file also spins up pgadmin for you, running at port 5050. Simply open http://localhost:5050 and open the database you're interested in (either the event-processor DB or multiplayer DB). When prompted for the password, enter `admin`.

## 😩 Running without Docker

Of course, you can also run the app locally without relying on the local Drips stack via Docker. However, you'll need to supply your own environment variables based on `.env.template`.

To start the app directly on your machine, run `npm run dev` to start the dev server.

## 📃 E2E tests

We use Playwright together with our local dev stack for running E2E tests on the app.

To run tests, make sure you have all dependencies and Playwright browsers installed:

```
npm i && npx playwright install
```

After that, run...

```
npm run test:e2e
```

... to bring up the local stack and start the Playwright test UI. By default, it starts the app up in dev server mode, so that you can fix things and debug tests without having to re-start the entire stack every time.

Any state changes made in the local dev stack are not persisted for E2E runs, meaning that every time you start e2e test mode, the state is a blank slate.

To run all tests in headless mode, run...

```
npm run test:e2e:headless
```

### Writing tests

E2E tests go into the `/tests/` directory.

Tip: Run `npx playwright codegen http://localhost:5173` after starting the local dev stack to bring up a test recorder that automatically writes tests for you as you interact with the app.

### Limitations

Tests all run against the same local dev stack, which is created before tests are triggered, and destroyed afterwards. This means that separate tests need to be designed such that state changes they trigger on the local dev stack (e.g. projects being claimed, tokens being topped up, drip lists being created etc.) do not interfere with any other test.
