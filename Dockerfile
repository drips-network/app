# Based on the solution posted further down from
# https://www.answeroverflow.com/m/1210080779267481670#solution-1210102172117631027

# Use the official Node.js 22 image as a base
FROM node:22

# Set host environment variables
# Based on .env.template
# See https://docs.railway.app/guides/dockerfiles#using-variables-at-build-time
ARG PUBLIC_PINATA_GATEWAY_URL

ARG INFURA_KEY
ARG ALCHEMY_KEY
ARG FILECOIN_KEY

ARG E2E_HEADLESS

ARG PINATA_SDK_KEY
ARG PINATA_SDK_SECRET

ARG TENDERLY_USER
ARG TENDERLY_PROJECT
ARG TENDERLY_ACCESS_SECRET

ARG GELATO_API_KEY

ARG PUBLIC_NETWORK

ARG COINMARKETCAP_API_KEY

ARG GITHUB_PERSONAL_ACCESS_TOKEN

ARG ETHERSCAN_API_KEY

ARG GQL_URL
ARG GQL_ACCESS_TOKEN
ARG CODEGEN_GQL_URL

ARG CACHE_REDIS_CONNECTION_STRING

ARG PUBLIC_BASE_URL

ARG MULTIPLAYER_API_URL
ARG MULTIPLAYER_API_ACCESS_TOKEN

ARG MEILISEARCH_HOST
ARG MEILISEARCH_API_KEY

# Set environment variables to optimize the container
ENV NODE_ENV production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH "/usr/bin/google-chrome-stable"

# Install necessary dependencies for Puppeteer's Chrome
# These dependencies are required to run Puppeteer/Chrome in a headless environment
# The contrib.list changes for ttf-mscorefonts-installer
RUN apt-get update && \
    apt-get install -y wget gnupg2 ca-certificates apt-transport-https software-properties-common && \
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
    echo "deb http://deb.debian.org/debian bookworm contrib non-free" > /etc/apt/sources.list.d/contrib.list && \
    apt-get update && \
    apt-get install -y google-chrome-stable ttf-mscorefonts-installer fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 --no-install-recommends && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies, including 'puppeteer'
RUN npm ci --ignore-scripts --include=dev

# Copy the rest of the application's code into the container
COPY . .

# Run the post install script
RUN npm run postinstall

# Install husky globally to run the prepare script
RUN npm install husky@9 -g
RUN npm run prepare

# Set up robots
RUN mv robots-disallow.txt ./static/robots.txt

# Build graphql types
RUN npm run build:graphql

# Expose the app port
EXPOSE 4173

# Build project
RUN npm run build

# Specify the command to run the app
CMD ["npm", "run", "preview"]
