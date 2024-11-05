#!/bin/bash

# cd to the scripts directory
cd "$(dirname "$(realpath -- "$0")")"

# print the current directory
pwd

# echo the command we're about to run
CMD="docker build $(./docker-buildargs.sh ../.env) ../. -f ../Dockerfile.dev -t drips-app-dev --platform=linux/amd64"
echo $CMD

# run the command
eval "$CMD"
