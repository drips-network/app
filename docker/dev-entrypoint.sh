#!/bin/bash

USER_ID=${LOCAL_UID:-9001}
GROUP_ID=${LOCAL_GID:-9001}

printf "\n   _____ __  __ \n"
printf "  / ____|  \/  |\n"
printf " | |  __| \  / |\n"
printf " | | |_ | |\/| |\n"
printf " | |__| | |  | |\n"
printf "  \_____|_|  |_|\n\n"
                
echo "ℹ️ Starting with UID: $USER_ID, GID: $GROUP_ID"
useradd -u $USER_ID -o -m drippy
groupmod -g $GROUP_ID drippy
export HOME=/home/drippy

ls -al | grep .svelte-kit

/usr/sbin/gosu drippy npm run gql:build

# chown node modules to drippy since it's an anon volume and owned by root
if [ -d "node_modules" ]; then
  chown -R drippy:drippy node_modules
fi

printf "\n🚀 Starting dev server...\n"
exec /usr/sbin/gosu drippy npm run dev -- --host 0.0.0.0
