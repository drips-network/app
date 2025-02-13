#!/bin/bash
set -eu
cleanup() {
    docker compose -f docker-compose.yml -f docker-compose.e2e.yml rm -fsv
}
trap cleanup EXIT

UI=false

if [[ $* == *--start-playwright-ui* ]]; then
    UI=true
fi

docker compose build && docker compose -f docker-compose.yml -f docker-compose.e2e.yml up --renew-anon-volumes --detach

printf "⏳ Waiting for the app to start..."

until curl -I -s http://localhost:5173/api/health | grep -q "200"; do
    printf "."
    sleep 1
done

printf "\n✅ The app is ready!\n"
printf "\n🚀 Running tests..."

if [ $UI = true ]; then
  npx playwright test --ui &
  docker compose logs app --follow
else
  npx playwright test
fi
