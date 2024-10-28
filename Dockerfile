# Use the official Node.js 20 image as a base
FROM node:22

# Set environment variables to optimize the container
ENV NODE_ENV production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH "/usr/bin/google-chrome-stable"

# Install necessary dependencies for Puppeteer's Chrome
# These dependencies are required to run Puppeteer/Chrome in a headless environment
RUN apt-get update && \
    apt-get install -y wget gnupg2 ca-certificates apt-transport-https software-properties-common && \
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
    apt-get update && \
    apt-get install -y google-chrome-stable --no-install-recommends && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean

# TODO: try this
# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chrome for Testing that Puppeteer
# installs, work.
# RUN apt-get update \
#     && apt-get install -y wget gnupg \
#     && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
#     && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
#     && apt-get update \
#     && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
#       --no-install-recommends \
#     && rm -rf /var/lib/apt/lists/*

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Copy scripts which will be executed when npm install is called
RUN mkdir -p ./scripts
COPY ./scripts/ ./scripts/

# TODO: remove debug
RUN ls -la

# Install dependencies, including 'puppeteer'
RUN npm ci

# Copy the rest of your application's code into the container
COPY . .

# Set up robots
RUN mv robots-disallow.txt ./static/robots.txt

# Build graphql types
RUN npm run build:graphql

# Expose the port your app runs on
EXPOSE 8080

# Build Next.js project
CMD npm run build

# Expose the port your app runs on
# EXPOSE 3000

# Specify the command to run your app
# CMD ["npm", "run", "production"]