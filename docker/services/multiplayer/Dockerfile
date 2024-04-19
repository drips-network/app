FROM node:20-alpine3.16

RUN apk add --no-cache git
RUN apk add --no-cache g++ make py3-pip
RUN apk add --no-cache postgresql-client

WORKDIR /app

ARG MULTIPLAYER_BRANCH=main
ADD "https://api.github.com/repos/drips-network/multiplayer/commits/${MULTIPLAYER_BRANCH}?per_page=1" latest_commit
RUN git clone --branch ${MULTIPLAYER_BRANCH} --single-branch https://github.com/drips-network/multiplayer.git

WORKDIR /app/multiplayer
RUN npm ci --fetch-timeout=600000
COPY ./services/multiplayer/envfile .env.prod

RUN npm run build

COPY ./services/multiplayer/start.sh start.sh

EXPOSE 5002

CMD ["sh", "start.sh"]
