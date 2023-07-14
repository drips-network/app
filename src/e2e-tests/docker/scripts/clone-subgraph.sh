#!/bin/bash
set -euo pipefail

echo "⬇️ Downloading drips-subgraph…"
git clone -b feature/dependency-funding --single-branch https://github.com/radicle-dev/drips-subgraph

echo "📁 Creating subgraph config file for local env"
cd ./drips-subgraph
printf '{ "network": "goerli", "immutableSplitsDriver": { "address": "0xaD2E5BECB55D12bc6D011c70226b82E642fFCF14", "block": 1 }, "repoDriver": { "address": "0x70F397E19fBc78f1F2090C3F4137BEd4fAD5C79e", "block": 1 }, "drips": { "address": "0x476FB1C8745AffE9B3032C58c83AEA4C05Ddf136", "block": 1 }, "nftDriver": { "address": "0xa16D9683E368a72F5a3ee5761298589dB129fcbc", "block": 1 },"metaData": { "address": "0xC58cEa5a448A761d2dE80DFa8BfE298780e9dd66", "block": 1 } }' > config.json
echo "🛠 Installing subgraph deps…"
npm install

echo "📁 Writing subgraph.yaml for local deployment …"
npx mustache config.json subgraph.template.yaml > subgraph.yaml
