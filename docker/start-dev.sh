#!/bin/bash
set -eux
cleanup() {
    docker compose -f docker-compose.yml -f docker-compose.dev.yml rm -fsv
}
trap cleanup EXIT
docker compose build && docker compose -f docker-compose.yml -f docker-compose.dev.yml up --renew-anon-volumes --attach app
