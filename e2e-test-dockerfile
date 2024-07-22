FROM node:latest

# Get the latest version of Playwright
FROM mcr.microsoft.com/playwright:focal
 
RUN apt-get update && apt-get -y install make g++ gcc libnss3 libatk-bridge2.0-0 libdrm-dev libxkbcommon-dev libgbm-dev libasound-dev libatspi2.0-0 libxshmfence-dev

WORKDIR /app

COPY package.json .
COPY package-lock.json .
RUN ls
COPY scripts scripts

RUN mkdir -p static/twemoji

RUN npm ci --fetch-timeout=600000

RUN npx playwright install --with-deps

COPY . .
COPY /docker/app-e2e-test-env .env
COPY /docker/scripts/build-and-run-tests.sh .
