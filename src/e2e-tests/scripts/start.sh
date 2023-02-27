#!/bin/bash
set -euo pipefail

check() {
  lsof -Pi :5432 -sTCP:LISTEN -t >/dev/null && echo "💽 Postgres DB appears to be up…" || (echo "💀 Please ensure a Postgres DB is available at port 5432" && exit 1)
  lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null&& echo "🪐 IPFS node appears to be up…" || (echo "💀 Please ensure an IPFS node is available at port 5001" && exit 1)
}

spin() {
  spinner="/|\\-/|\\-"
  while :
  do
    for i in `seq 0 7`
    do
      echo -n "${spinner:$i:1}"
      echo -en "\010"
      sleep 0.1
    done
  done
}

setup() {
  pg_user=${PGUSER:-$(whoami)}
  pg_password=${PGPASSWORD:-postgres}
  pg_host=${PGHOST:-localhost}

  debug=${DEBUG:-false}

  # Create Graph Database
  echo "💽 Recreating graph-node database"
  psql -h $pg_host -U $pg_user -c 'DROP DATABASE IF EXISTS "graph-node"'
  psql -h $pg_host -U $pg_user -c 'CREATE DATABASE "graph-node"'
  echo "✅ Done"

  # Set env vars
  echo "🤓 Setting env vars"
  cd ./src/e2e-tests/.tmp/
  cd ./drips-contracts
  source ./scripts/local-env.sh
  echo "✅ Done"


  # Start anvil
  echo "🕸 Starting a local Ethereum testnet with Anvil"
  output=$(mktemp "${TMPDIR:-/tmp/}$(basename $0).XXX")
  anvil &> $output &
  if [ "$debug" = true ]; then tail -f $output & fi
  server_pid=$!
  echo "— Anvil pid: $server_pid"
  echo "— Output: $output"
  echo "⏳ Waiting for local Ethereum testnet to come online…"

  spin &
  SPIN_PID=$!
  trap "kill -9 $SPIN_PID 2>/dev/null" `seq 0 15`

  until grep -q -i 'Listening on 127.0.0.1:8545' $output
  do
    if ! ps $server_pid > /dev/null 
    then
      echo "💀 Anvil died" >&2
      echo "- You can check the logs at $output" >&2
      exit 1
    fi
    sleep 1
  done

  kill -9 $SPIN_PID


  echo "✅ Local testnet is running!" 


  # Deploy Drips Contracts
  echo "💧 Deploying Drips Contracts"
  echo "yes" | ./scripts/deploy.sh
  echo "✅ Done"


  # Deploy mock ERC-20
  echo "💰 Deploying Mock ERC-20"
  cd ../drips-contracts
  forge create $WALLET_ARGS ./lib/openzeppelin-contracts/contracts/token/ERC20/presets/ERC20PresetFixedSupply.sol:ERC20PresetFixedSupply --constructor-args "Testcoin" "TEST" 100000000000000000000 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
  echo "✅ Done"


  # Run graph node
  echo "📈 Running Graph Node"
  cd ../graph-node
  output=$(mktemp "${TMPDIR:-/tmp/}$(basename $0).XXX")
  echo "cargo run -p graph-node --release -- --postgres-url postgresql://$pg_user:$pg_password@$pg_host:5432/graph-node --ethereum-rpc goerli:all:http://localhost:8545 --ipfs localhost:5001" | /bin/bash &> $output &
  graph_pid=$!

  if [ "$debug" = true ]; then tail -f $output & fi

  echo "— Graph node pid: $graph_pid"
  echo "— Output: $output"
  echo "⏳ Waiting for the Graph Node to compile & start…"

  spin &
  SPIN_PID=$!

  until grep -q -i 'Started all assigned subgraphs' $output
  do
    if ! ps $graph_pid > /dev/null 
    then
      echo "💀 Graph Node died" >&2
      echo "- You can check the logs at $output" >&2
      exit 1
    fi
    sleep 1
  done

  kill -9 $SPIN_PID
  echo "✅ Graph node is running!" 


  # Deploy subgraph
  echo "Deploying Subgraph"
  cd ../drips-subgraph
  npm run create-local
  echo -e "\n" | npm run deploy-local

  background=${BACKGROUND:-false}

  if [ "$background" = true ]; then
    echo "Background mode. Keeping processes up and exiting."
    exit 0
  else
    read -p "✌️ Test environment is ready for your E2E tests. Press enter to stop the test environment."

    echo "🧹 Cleaning up processes…"
    pkill -9 anvil
    pkill -9 graph-node

    echo "👋 Bye"
  fi
}


skip_check=${SKIP_CHECK:-false}

if [ "$skip_check" != true ]; then
  (check)
fi
(setup)
