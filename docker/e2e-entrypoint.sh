#!/bin/bash

printf "\n   _____ __  __ \n"
printf "  / ____|  \/  |\n"
printf " | |  __| \  / |\n"
printf " | | |_ | |\/| |\n"
printf " | |__| | |  | |\n"
printf "  \_____|_|  |_|\n\n"

# store original PUBLIC_GQL_URL
ORIGINAL_PUBLIC_GQL_URL=${PUBLIC_GQL_URL}

export PUBLIC_GQL_URL=${PUBLIC_INTERNAL_GQL_URL}

printf "\n🏗️ Building app...\n"
npm run build

# restore PUBLIC_GQL_URL
export PUBLIC_GQL_URL=${ORIGINAL_PUBLIC_GQL_URL}

npm run preview -- --host 0.0.0.0 --port 5173
