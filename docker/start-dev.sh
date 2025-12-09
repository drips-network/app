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
# Auto-enable 'wave' profile if image is accessible
# Default tag to main if not set
WAVE_TAG=${WAVE_TAG:-main}

# Check if we can access the image manifest
if docker manifest inspect "j537/wave:$WAVE_TAG" > /dev/null 2>&1; then
  echo "🌊 Access to 'j537/wave:$WAVE_TAG' confirmed."

  if [ -z "${COMPOSE_PROFILES:-}" ]; then
    echo "Enabling 'wave' profile."
    export COMPOSE_PROFILES=wave
  elif [[ ",${COMPOSE_PROFILES}," != *",wave,"* ]]; then
    echo "Adding 'wave' to existing profiles."
    export COMPOSE_PROFILES="${COMPOSE_PROFILES},wave"
  fi
else
  echo "⚠️  No access to 'j537/wave:$WAVE_TAG'. Wave service will not be enabled."
fi

docker compose -f docker-compose.yml -f docker-compose.dev.yml build && docker compose -f docker-compose.yml -f docker-compose.dev.yml up --renew-anon-volumes --attach app
