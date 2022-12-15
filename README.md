![Drips Logo illustration](/docs/assets/drips-logo-illustration.png)

# Radicle Drips V2 App

| 🏗️ This app is under active development, and currently available for testing as a [pre-release version on the Goerli Tesnet](https://drips-app-v2-radicle.vercel.app/). |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

Drips 💧 is an Ethereum protocol for streaming and splitting tokens. It allows users and web3 apps to stream and split funds by the second, enabling continuous settlement for use cases like contributor payments, vesting and subscription memberships.

This app enables user-friendly, simple management of token streams on the Drips network. Users can top-up any ERC-20 token to their Drips account, create streams to any Ethereum address, set up a Splits configuration for their account, and withdraw funds earned from incoming streams.

As we get closer to release, we will share further documentation on the app's features.

## 💦 Getting started on Goerli Testnet

You can either run the app locally by following the steps provided in the [Development Guide](/docs/development.md), or simply access the latest main deployment at [drips-app-v2-radicle.vercel.app](https://drips-app-v2-radicle.vercel.app/).

Click "App" in the top-right corner and connect your wallet to access your personal dashboard.

In order to top-up Görli funds, you can use a Goerli faucet (we like [this one](https://goerli-faucet.pk910.de/)) to get some Görli ETH, and then swap for Görli WETH or UNI on Uniswap (make sure your wallet is connected to Görli). After that’s done, you should be able to top up WETH or UNI within the Drips app, and test all features.

You can also obtain Goerli RAD funds (Radicle's own governance token) by heading over to https://app.radicle.xyz/faucet with your wallet connected to Goerli. The Goerli RAD token contract is not part of our default token list, so you need to add [its address](https://github.com/radicle-dev/radicle-contracts#contracts-deployed-on-goerli) to your custom token list within the Drips App before you can use it. To do so, head over to Settings → Custom Tokens.

## 📝 Submitting feedback

Please create an issue with your feedback on our repo, and tag it with `bug` (for things that aren’t working right) or `enhancement` (for feature ideas, or improvements for existing features). Please briefly check if an issue already exists for what you’re about to report.

If you’re suggesting copy changes, please create a single issue for all your suggestions and ideally group them sensibly (by page, section, flow, etc.)

If your feedback is about the landing page, please also tag it with `landing page`.

Thank you for your feedback! ✌️
