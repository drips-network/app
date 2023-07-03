#!/bin/bash
set -euo pipefail

echo "⬇️ Downloading drips-subgraph…"
git clone -b feature/dependency-funding --single-branch https://github.com/radicle-dev/drips-subgraph

echo "📁 Creating subgraph config file for local env"
cd ./drips-subgraph
printf '{ "network": "goerli", "immutableSplitsDriver": { "address": "0x34466661145b6D19f32Ae0f4b2BFD3874573bdf0", "block": 1 }, "repoDriver": { "address": "0x45Aa599e4EB38300025eAB83908652bcC61601D4", "block": 1 }, "dripsHub": { "address": "0xa328B55BFF30EfF12591Cdfb3dcF4c12d804f583", "block": 1 }, "nftDriver": { "address": "0x55329C69414e88279a21c862b8195c1C64b4da96", "block": 1 },"metaData": { "address": "0xC58cEa5a448A761d2dE80DFa8BfE298780e9dd66", "block": 1 } }' > config.json
echo "🛠 Installing subgraph deps…"
npm install

echo "📁 Writing subgraph.yaml for local deployment …"
npx mustache config.json subgraph.template.yaml > subgraph.yaml
