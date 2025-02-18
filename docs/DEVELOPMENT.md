# 🤓 Development Instructions

The stack for the Drips App contains a number of services, which can all be run entirely locally for development. For this, we use `docker compose`. 

## 🚀 Quick Start

[!IMPORTANT]
Our local Docker-based stack described below currently runs only on `linux/arm64` systems (which also works on Apple ARM machines or ARM-based Windows devices with WSL). If you're on Windows or an amd64 Linux machine, you'll need to run the standard dev server with `npm run dev` and bring your own environment variables based on `.env.template`. If this is blocking you from contributing, please reach out to us so we can prioritize building Docker images for `linux/amd64`.

First, run `npm i` to install dependencies.

Create an empty `.env` file by running `touch .env`.

To run a local dev environment, simply run `npm run dev:docker`. This will start all necessary services for running the Drips app locally, complete with a local testnet that has the Drips protocol contracts and a test ERC-20 deployed. After this, set up MetaMask for the local testnet by following the instructions below.

No values in `.env` should be required for running the local dev stack, however setting `GITHUB_PERSONAL_ACCESS_TOKEN` is strongly recommended. Without it, the app will be heavily rate-limited by the GitHub API, and loading project data may fail.

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
