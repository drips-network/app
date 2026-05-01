#!/bin/bash

printf "Mining a block on the local Anvil chain...\n\n"

exec docker run --rm --network host --entrypoint cast ghcr.io/foundry-rs/foundry:latest rpc evm_mine --rpc-url http://127.0.0.1:8545
