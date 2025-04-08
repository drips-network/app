#!/bin/bash
set -eu

cleanup() {
    docker compose -f docker-compose.yml -f docker-compose.dev.yml rm -fsv
}
trap cleanup EXIT

touch .env

ARCH=$(uname -m)
case "$ARCH" in
  x86_64 | amd64)
    ARCH="amd64"
    ;;
  aarch64 | arm64 | armv8*)
    ARCH="arm64"
    ;;
  *)
    echo "Unsupported architecture: $ARCH"
    exit 1
    ;;
esac
export ARCH

export LOCAL_UID=$(id -u)
export LOCAL_GID=$(id -g)

# source .env file
export $(grep -v '^#' .env | xargs)

if [[ -z "$GQL_ACCESS_TOKEN" || (-z "$GQL_URL" && -z "$CODEGEN_GQL_URL") ]]; then
  echo "Error: Please add the GITHUB_PERSONAL_ACCESS_TOKEN environment variable in .env."
  echo "This is required to communicate with the GraphQL API for loading public repository information."
  echo "If you don't have one, go to GitHub developer settings, and create a Personal Access Token (classic) with NO permissions."
  exit 1
fi

docker compose -f docker-compose.yml -f docker-compose.dev.yml build && docker compose -f docker-compose.yml -f docker-compose.dev.yml up --renew-anon-volumes --attach app
