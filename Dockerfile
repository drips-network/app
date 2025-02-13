# This Dockerfile is used for builds on Railway. For all other purposes, use the generic `Dockerfile.dockerhub` in root dir.

FROM node:22

ENV NODE_ENV=production

# Usually, DO NOT set these in the Dockerfile. This is only for building the image in Railway.
ARG CODEGEN_GQL_URL
ARG GQL_ACCESS_TOKEN

# Pass robots-allow.txt to serve a permissive robots.txt file
ARG ROBOTS_FILE=robots-disallow.txt

ARG PUBLIC_PINATA_GATEWAY_URL

ARG INFURA_KEY
ARG ALCHEMY_KEY
ARG FILECOIN_KEY

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

ARG ECOSYSTEM_API_URL
ARG ECOSYSTEM_API_ACCESS_TOKEN

WORKDIR /app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN apt-get update \
 && apt-get install -y chromium \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends

# Install necessary dependencies for Puppeteer's Chrome
# These dependencies are required to run Puppeteer/Chrome in a headless environment
# The contrib.list changes for ttf-mscorefonts-installer
RUN apt-get install -y wget chromium
# Set the Chrome repo.

# Copies both package.json and package-lock.json
COPY package*.json ./
# Install dependencies
RUN npm ci --ignore-scripts --include=dev;

# Copy the rest of the application's code into the container
COPY . .

RUN npm run postinstall

# Set up robots
RUN mv ${ROBOTS_FILE} ./static/robots.txt

# Fetch GQL schema from API at `CODEGEN_GQL_URL` and save it to schema.graphql for type generation.
RUN npm run gql:generate-schema

# This relies on schema.graphql file being present in the root dir.
RUN npm run gql:build-types

# While building the app, we set dummy values for GQL_URL so that the build passes. When running the image these need to be set in env
RUN npm run build:app

EXPOSE 8080

# Run the app (this is not a build command, it runs /build/index.js)
CMD ["node", "build"]
