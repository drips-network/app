#!/bin/bash

# cd to the scripts directory
cd "$(dirname "$(realpath -- "$0")")"
# print the current directory
pwd
# echo the command we're about to run
echo $(./docker-buildargs.sh ../.env)
# run the command
docker build $(./docker-buildargs.sh ../.env) ../. -t drips-app --platform=linux/amd64