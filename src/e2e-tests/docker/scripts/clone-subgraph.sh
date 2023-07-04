#!/bin/bash
set -euo pipefail

echo "⬇️ Downloading drips-subgraph…"
git clone -b feature/dependency-funding --single-branch https://github.com/radicle-dev/drips-subgraph

echo "📁 Creating subgraph config file for local env"
cd ./drips-subgraph
printf '{ "network": "goerli", "immutableSplitsDriver": { "address": "0xb2f6201d24450CbFC6a0546AE1fB3cf89baa6673", "block": 1 }, "repoDriver": { "address": "0x62e886FE90d1f344429A1546bA40b471CfA1c7f7", "block": 1 }, "drips": { "address": "0x2539d64eE9059AE1CC662A44265E4C33cf00100d", "block": 1 }, "nftDriver": { "address": "0x5E94A33309b1F9895Ba5b567d53E8234b90C1701", "block": 1 },"metaData": { "address": "0xC58cEa5a448A761d2dE80DFa8BfE298780e9dd66", "block": 1 } }' > config.json
echo "🛠 Installing subgraph deps…"
npm install

echo "📁 Writing subgraph.yaml for local deployment …"
npx mustache config.json subgraph.template.yaml > subgraph.yaml
