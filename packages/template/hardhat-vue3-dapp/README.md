# hardhat-vue3-dapp

This repository contains a sample project that you can use as the starting point for your Ethereum project. It's also a great fit for learning the basics of smart contract development.

This project is intended to be used with the [Hardhat Beginners Tutorial](https://hardhat.org/tutorial/), but you should be able to follow it by yourself by reading the README and exploring its contracts, tests, scripts and frontend directories.

## Quick start

The first things you need to do are cloning this repository and installing its dependencies:

```sh
skr create <project-name> --template hardhat-vue3-dapp
cd <project-name>
npm install
```

Once installed, let's run Hardhat's testing network:

```sh
npm run typechain
npx hardhat node
```

Then, on a new terminal, go to the repository's root folder and run this to deploy your contract:

```sh
npm run deploy
```

Finally, we can run the frontend with:

```sh
npm run dev
```

Open http://localhost:3000/ to see your Dapp. You will need to have [Metamask](https://metamask.io/) installed and listening to localhost 8545.

## Troubleshooting

- `Invalid nonce` errors: if you are seeing this error on the `npx hardhat node` console, try resetting your Metamask account. This will reset the account's transaction history and also the nonce. Open Metamask, click on your account followed by `Settings > Advanced > Reset Account`.
