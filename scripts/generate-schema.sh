#!/bin/bash

source .env


# If GQL_URL or GQL_ACCESS_TOKEN env vars aren't set, print an error and exit with 1
if [ -z "$GQL_URL" ] || [ -z "$GQL_ACCESS_TOKEN" ] ; then
  echo "Error: In order to build GraphQL types, you must provide GQL_URL and GQL_ACCESS_TOKEN env vars for the Drips GraphQL API."
  echo "Default values are included in .env.template."
  exit 1
fi

echo "🌐 Downloading schema from $GQL_URL to ./schema.graphql..."

start_time=$(date +%s)
end_time=$((start_time + 300))  # 5 minutes = 300 seconds

find . -regex './src/.*__generated__.*' -type d -prune -exec rm -r "{}" \;

while [[ $(date +%s) -lt $end_time ]]; do
  graphql-codegen --config generate-schema.codegen.ts
  if [[ $? -eq 0 ]]; then
    exit 0  # Success
  fi
  echo "Failed to generate GraphQL types. Retrying..."
  sleep 1
done

# If the loop completes without success, exit with 1
exit 1
