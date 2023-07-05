#!/bin/bash
set -euo pipefail

echo "⬇️ Downloading drips-subgraph…"
git clone -b feature/dependency-funding --single-branch https://github.com/radicle-dev/drips-subgraph

echo "📁 Creating subgraph config file for local env"
cd ./drips-subgraph
printf '{ "network": "goerli", "immutableSplitsDriver": { "address": "0xF4A093CFa3125a1C9F3c029703C792Ce19fc946B", "block": 1 }, "repoDriver": { "address": "0xE57458b012E2e261BBc9e827F80FF82CB9043064", "block": 1 }, "drips": { "address": "0x81f95dC02f0C70175c20AEfE91C9EFe34B5aefaf", "block": 1 }, "nftDriver": { "address": "0xfaF77afa82D7b277cebad7FDbF70E3424a185B67", "block": 1 },"metaData": { "address": "0xC58cEa5a448A761d2dE80DFa8BfE298780e9dd66", "block": 1 } }' > config.json
echo "🛠 Installing subgraph deps…"
npm install

echo "📁 Writing subgraph.yaml for local deployment …"
npx mustache config.json subgraph.template.yaml > subgraph.yaml
