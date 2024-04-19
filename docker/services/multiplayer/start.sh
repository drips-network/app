#!/bin/bash

until pg_isready -U postgres -h postgres-multiplayer; do
  echo "Postgres is unavailable - waiting"
  sleep 2
done
echo "Postgres is up - executing command"

NODE_ENV=prod node dist/src/main.js
