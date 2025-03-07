#!/bin/bash

printf "\n   _____ __  __ \n"
printf "  / ____|  \/  |\n"
printf " | |  __| \  / |\n"
printf " | | |_ | |\/| |\n"
printf " | |__| | |  | |\n"
printf "  \_____|_|  |_|\n\n"

printf "\n🏗️ Building app...\n"
npm run build

npm run preview -- --host 0.0.0.0 --port 5173
