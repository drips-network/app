#!/bin/bash

echo "🦺 Building GraphQL types based on ./schema.graphql..."

# If ./src/lib/graphql/__generated__/schema.graphql file doesn't exist, print an error and exit with 1
if [ ! -f ./schema.graphql ]; then
  echo "Error: ./src/lib/graphql/__generated__/schema.graphql file doesn't exist. Run 'npm run generate-schema' first."
  exit 1
fi


start_time=$(date +%s)
end_time=$((start_time + 300))  # 5 minutes = 300 seconds

find . -regex './src/.*__generated__.*' -type d -prune -exec rm -r "{}" \;

while [[ $(date +%s) -lt $end_time ]]; do
  npx graphql-codegen
  if [[ $? -eq 0 ]]; then
    exit 0  # Success
  fi
  echo "Failed to generate GraphQL types. Retrying..."
  sleep 1
done

# If the loop completes without success, exit with 1
exit 1
