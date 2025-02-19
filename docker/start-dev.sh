#!/bin/bash
set -eu

cleanup() {
    docker compose -f docker-compose.yml -f docker-compose.dev.yml rm -fsv
}
trap cleanup EXIT

touch .env

ARCH=$(uname -m)
if [ "$ARCH" = "x86_64" ]; then
    ARCH="amd64"
fi
export ARCH

docker compose -f docker-compose.yml -f docker-compose.dev.yml build && docker compose -f docker-compose.yml -f docker-compose.dev.yml up --renew-anon-volumes --attach app
