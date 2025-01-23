FROM node:22

ARG SKIP_BUILD=false

# Usually, DO NOT set these in the Dockerfile. This is only for building the image in Railway.
# When building the image for publishing, leave it empty and instead run npm run gql:generate-schema before building the image.
ARG GQL_URL
ARG GQL_ACCESS_TOKEN

# Pass robots-allow.txt to serve a permissive robots.txt file
ARG ROBOTS_FILE=robots-disallow.txt

ARG PUBLIC_NETWORK=1
ENV PUBLIC_NETWORK=${PUBLIC_NETWORK}

WORKDIR /app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN apt-get update \
 && apt-get install -y chromium \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends

# Copies both package.json and package-lock.json
COPY package*.json ./
# Install dependencies
RUN npm ci --ignore-scripts;

# Copy the rest of the application's code into the container
COPY . .

RUN npm run postinstall

# Set up robots
RUN mv ${ROBOTS_FILE} ./static/robots.txt

# If GQL_URL and GQL_ACCESS_TOKEN are set, AND schema.graphql is NOT present, fetch the schema from the server.
# This allows building the app within Railway.
RUN if ["$SKIP_BUILD" = "false"] && [ -n "$GQL_URL" ] && [ -n "$GQL_ACCESS_TOKEN" ] && [ ! -f schema.graphql ]; then npm run gql:generate-schema; fi

# Check on schema.graphql file being present in root dir, if not print error
RUN test -f schema.graphql || (echo "schema.graphql file not found in root directory. Run gql:generate-schema before trying to build the container." && exit 1)

# This relies on schema.graphql file being present in the root dir.
RUN if [ "$SKIP_BUILD" = "false" ]; then npm run gql:build-types; fi

# While building the app, we set dummy values for GQL_ACCESS_TOKEN and GQL_URL so that the build passes. When running the image these need to be set in env
RUN if [ "$SKIP_BUILD" = "false" ]; then GQL_ACCESS_TOKEN="foobar" GQL_URL="foobar" npm run build:app; fi

EXPOSE 3000

# Run the app (this is not a build command, it runs /build/index.js)
CMD ["node", "build"]
