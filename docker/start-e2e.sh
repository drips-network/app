#!/bin/bash
set -eu

UI=false
PROD_BUILD=false

cleanup() {
    docker compose -f docker-compose.yml rm -fsv
}
trap cleanup EXIT

touch .env

if [[ $* == *--start-playwright-ui* ]]; then
    UI=true
fi

if [[ $* == *--prod-build* ]]; then
    PROD_BUILD=true
fi

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

if [ $PROD_BUILD = true ]; then
  docker compose build && APP_USE_LOCAL_TESTNET_WALLET_STORE=true docker compose -f docker-compose.yml -f docker-compose.e2e.yml up --renew-anon-volumes --detach
else
  docker compose build && APP_USE_LOCAL_TESTNET_WALLET_STORE=true docker compose -f docker-compose.yml up --renew-anon-volumes --detach
fi


printf "⏳ Waiting for the app to start..."

until curl -I -s http://localhost:5173/api/health | grep -q "200"; do
    printf "."
    sleep 1
done

printf "\n✅ The app is ready!\n"
printf "\n🚀 Running tests..."

if [ $UI = true ]; then
  npx playwright test --ui-port 0 &
  docker compose logs app --follow
else
  npx playwright test
fi
