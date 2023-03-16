#!/bin/bash
set -euo pipefail

echo "🧹 Cleaning up tmp dir…"
cd ./src/e2e-tests/.tmp/
rm -rf ./*

echo "⬇️ Downloading graph-node…"
mkdir graph-node
cd graph-node
git init
git remote add origin https://github.com/graphprotocol/graph-node
git fetch origin 6ced10d91feaa0d5de4369975195d2ca2e8b23e6
git reset --hard FETCH_HEAD
cd ..

echo "⬇️ Downloading drips-contracts…"
git clone -b master --single-branch https://github.com/radicle-dev/drips-contracts

echo "⬇️ Downloading drips-subgraph…"
git clone -b v2 --single-branch https://github.com/radicle-dev/drips-subgraph

echo "📁 Creating subgraph config file for local env"
cd ./drips-subgraph
printf '{ "network": "goerli", "immutableSplitsDriver": { "address": "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e", "block": 1 }, "dripsHub": { "address": "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0", "block": 1}, "nftDriver": { "address": "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6", "block": 1},"metaData": { "address": "0xC58cEa5a448A761d2dE80DFa8BfE298780e9dd66", "block": 1} }' > config.json
echo "🛠 Installing subgraph deps…"
npm install

echo "📁 Writing subgraph.yaml for local deployment…"
npx mustache config.json subgraph.template.yaml > subgraph.yaml

echo "✅ Done"
