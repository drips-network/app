#!/bin/bash
set -eu

UI=false

cleanup() {
    docker compose -f docker-compose.yml rm -fsv
}
trap cleanup EXIT

touch .env

if [[ $* == *--start-playwright-ui* ]]; then
    UI=true
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
docker compose build && APP_USE_LOCAL_TESTNET_WALLET_STORE=true docker compose -f docker-compose.yml up --renew-anon-volumes --detach

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
