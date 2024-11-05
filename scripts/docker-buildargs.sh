# !/bin/bash

# Given an env file, remove blank lines and comments and turn
# those lines into "--build-arg X=Y --build-arg Z=W ..."
grep -v -e '^[[:space:]]*$' -e '^#' $@ | awk '{ sub ("\\\\$", " "); printf " --build-arg %s", $0  } END { print ""  }'