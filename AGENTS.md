# 🤓 Development Instructions

## 📑 Documentation

Find technical documentation for the app here: https://deepwiki.com/drips-network/app

## 🚀 Starting a local environment

Start the dev environment with `APP_USE_LOCAL_TESTNET_WALLET_STORE=true npm run dev:docker`. This will put the app in a mode in which it doesn't require a wallet, and instead connects directly to the first available test address when clicking `Connect`. In this mode, all transactions and signatures will immediately be accepted by the fake "wallet".
Docker will automatically download all required services and start a fully local environment of the Drips infrastructure. The app's dev server will listen on port 5173 by default.

### Clearing the local environment

Data of stateful services (and the testnet) is generally automatically persisted. To clear everything and start from scratch, run `npm run dev:docker:clear`.

### Dev mode

Head to Settings within the app and enable "Developer mode" to display helpful "Development" sections on screens like the Project Profile, Drip Lists, Streams etc.

### Claiming a project using the fake oracle

Drips uses an on-chain oracle service to validate ownership of repositories by looking up a `FUNDING.json` file on the repo's default branch. On the local development testnet, a fake oracle that can be used to fake the contents of this file is available.

To claim a project during local dev mode:

- If you haven't already, enable "Developer mode" in the app settings.
- Navigate to the project page of a repo you want to claim by pasting its GitHub URL into the app's search bar
- Copy the project's Account ID.
- Begin the claiming process, which will prompt you to add the FUNDING.json file with an entry for "localtestnet" to the repository.
- After confirming the claim process, the app will prompt you to send a transaction to request an owner update on-chain. Sign and submit this transaction.
- Right after, run `npm run dev:docker:update-repo-owner`. You will be prompted to submit the account ID of the project you want to claim, and the address that should be set as its owner. Enter the address you previously configured in `FUNDING.json` for `localtestnet`.
- Submit, and the fake oracle will update the owner of the project to the address you specified. The claim flow will continue.

## Unit tests

Run unit tests using `npm run test:unit`.

## E2E tests

We use Playwright together with our local dev stack for running E2E tests on the app.

To run tests, make sure you have all dependencies and Playwright browsers installed:

```
npm i && npx playwright install
```

After that, run...

```
npm run test:e2e:headless
```

... to run E2E tests against the local env (with automatically cleared state). You must first close the dev environment before running this command.

## Linting

Before submitting changes, run `npx lint-staged --concurrent false` and `npm run check`. This will ensure there are no linting or compiler errors.

## Adding a new blog post

Blog posts are markdown files stored in `src/blog-posts/`. To add a new blog post, create a new markdown file in that directory. There needs to be specific frontmatter - please refer to existing blog posts for examples.
