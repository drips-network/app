#!/bin/bash
set -euo pipefail

echo "⬇️ Downloading drips-subgraph…"
git clone -b feature/dependency-funding --single-branch https://github.com/radicle-dev/drips-subgraph

echo "📁 Creating subgraph config file for local env"
cd ./drips-subgraph
printf '{ "network": "goerli", "immutableSplitsDriver": { "address": "0xEC8493BdbBbBe22a6F54573cFeE23ac8Ab90dF77", "block": 0 }, "repoDriver": { "address": "0xb9C8e18E82687a564Ac4D26E22D28a4C95057CE9", "block": 0 }, "drips": { "address": "0xa0523b86472561f0859d84C094cc04e6c4B33169", "block": 0 }, "nftDriver": { "address": "0xc95eb214845d5693abc750692161CB008796ae5C", "block": 0 },"metaData": { "address": "0xC58cEa5a448A761d2dE80DFa8BfE298780e9dd66", "block": 0 } }' > config.json
echo "🛠 Installing subgraph deps…"
npm install

echo "📁 Writing subgraph.yaml for local deployment …"
npx mustache config.json subgraph.template.yaml > subgraph.yaml
