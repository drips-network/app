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

# source .env file, preventing an error related to multiline values e.g. RSA keys
set -a
source .env
set +a

# Auto-enable 'wave' profile if image is accessible and profiles aren't manually set
# Check for Wave service access
source ./docker/detect-wave.sh

docker compose -f docker-compose.yml -f docker-compose.dev.yml build && docker compose -f docker-compose.yml -f docker-compose.dev.yml up --renew-anon-volumes --attach app
