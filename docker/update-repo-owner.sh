# Read flags into variables
while [ "$1" != "" ]; do
  case $1 in
    --accountId )
      shift
      repo_account_id=$1
      ;;
    --ownerAddress )
      shift
      new_owner_address=$1
      ;;
    --useCast )
      use_cast=true
      ;;
    * )
      echo "Invalid argument: $1"
      exit 1
  esac
  shift
done

# Only ask for input if repo_account_id is not defined
if [ -z "$repo_account_id" ]; then
  printf "Enter the repo account ID to update the owner for.\n"
  printf "Hint: You can find this by enabling \"Developer mode\" in the app settings and navigating to the project profile.\n\n"
  read -p "- Repo Account ID: " repo_account_id
fi

# Only ask for input if new_owner_address is not defined
if [ -z "$new_owner_address" ]; then
  printf "Enter the owner address that should be set for the repo.\n"
  read -p "- New owner address to set: " new_owner_address
fi

printf "\nSending the transaction. This will only work if you have the local env running (npm run dev:docker)...\n\n"

if [ "$use_cast" = true ]; then
  printf "Using local cast command...\n\n"
  cast send --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
    0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9 \
    "updateOwner(address,uint256,address)" \
    0x971e08fc533d2A5f228c7944E511611dA3B56B24 \
    $repo_account_id $new_owner_address
else
  exec docker run --rm --network host --entrypoint cast ghcr.io/foundry-rs/foundry:latest send \
    --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
    0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9 \
    "updateOwner(address,uint256,address)" \
    0x971e08fc533d2A5f228c7944E511611dA3B56B24 \
    $repo_account_id $new_owner_address
fi
