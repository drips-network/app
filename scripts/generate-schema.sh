#!/bin/bash

source .env

# GQL_ACCESS_TOKEN is always required, plus either GQL_URL or CODEGEN_GQL_URL. If these requirements aren't satisfied, exit with an error.
# Again, this has to check that 1) GQL_ACCESS_TOKEN is set, AND THAT EITHER GQL_URL OR CODEGEN_GQL_URL is provided
if [[ -z "$GQL_ACCESS_TOKEN" || (-z "$GQL_URL" && -z "$CODEGEN_GQL_URL") ]]; then
  echo "Error: In order to build GraphQL types, you must provide GQL_URL (or CODEGEN_GQL_URL) and GQL_ACCESS_TOKEN env vars for the Drips GraphQL API."
  echo "Default values are included in .env.template."
  exit 1
fi

echo "🌐 Downloading schema from $GQL_URL to ./schema.graphql..."

start_time=$(date +%s)
end_time=$((start_time + 300))  # 5 minutes = 300 seconds

find . -regex './src/.*__generated__.*' -type d -prune -exec rm -r "{}" \;

while [[ $(date +%s) -lt $end_time ]]; do
  npx graphql-codegen --config generate-schema.codegen.ts
  if [[ $? -eq 0 ]]; then
    exit 0  # Success
  fi
  echo "Failed to generate GraphQL types. Retrying..."
  sleep 1
done

# If the loop completes without success, exit with 1
exit 1
