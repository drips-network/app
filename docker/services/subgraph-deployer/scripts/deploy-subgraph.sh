#!/bin/bash
set -euo pipefail

echo "Waiting for graph node to launch on 8020..."
bash -c 'while [[ "$(curl -s -o /dev/null -w ''%{http_code}'' graph-node:8020)" != "405" ]]; do sleep 5; done'
echo "graph node launched"

echo "📈 Deploying Subgraph"
cd /drips-subgraph
cat config.json
cat subgraph.yaml
npx graph create drips-subgraph-local --node http://graph-node:8020
npx graph deploy drips-subgraph-local --node http://graph-node:8020 --ipfs http://ipfs:5001 --version-label v0.0.1
