printf "Enter the repo account ID to update the owner for.\n"
printf "Hint: You can find this by enabling \"Developer mode\" in the app setting's and navigating to the project profile.\n\n"
read -p "- Repo Account ID: " repo_account_id

printf "Enter the owner address that should be set for the repo.\n"
read -p "- New owner address to set: " new_owner_address

printf "\nSending the transaction. This will only work if you have the local env running (npm run dev:docker)...\n\n"

exec docker run --network host --entrypoint cast ghcr.io/foundry-rs/foundry:latest send --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9 "updateOwner(address,uint256,address)" 0x971e08fc533d2A5f228c7944E511611dA3B56B24 $repo_account_id $new_owner_address
