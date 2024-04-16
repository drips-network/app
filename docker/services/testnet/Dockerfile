FROM ghcr.io/foundry-rs/foundry:latest

COPY ./services/testnet/state state

ENTRYPOINT anvil --state ./state --mnemonic "fame elevator saddle renew match guilt seat duck seven buyer true smoke" --host 0.0.0.0
