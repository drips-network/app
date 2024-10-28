#!/bin/bash

start_time=$(date +%s)
end_time=$((start_time + 300))  # 5 minutes = 300 seconds

find . -regex './src/.*__generated__.*' -type d -prune -exec rm -r "{}" \;

while [[ $(date +%s) -lt $end_time ]]; do
  graphql-codegen --config ./codegen.ts
  if [[ $? -eq 0 ]]; then
    exit 0  # Success
  fi
  echo "Failed to generate GraphQL types. Retrying..."
  sleep 1
done

# If the loop completes without success, exit with 1
exit 1
