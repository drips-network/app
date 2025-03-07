
while [ "$1" != "" ]; do
  case $1 in
    --rpcUrl )
      shift
      rpcUrl=$1
      ;;
    --privateKey )
      shift
      privateKey=$1
      ;;
    --chainId )
      chainId=true
      ;;
    * )
      echo "Invalid argument: $1"
      exit 1
  esac
  shift
done

docker pull j537/sprinkler:main
exec docker run --rm -e SHOULD_RUN=true -e CHAIN_ID=31337 -e WALLET_PRIVATE_KEY=2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6 -e RPC_URL=http://localhost:8545 -e POSTGRES_CONNECTION_STRING=postgresql://user:admin@localhost:54320/dripsdb --network host j537/sprinkler:main
