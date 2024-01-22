FROM node:20-alpine3.16

RUN apk add --no-cache git

WORKDIR /app

ARG FAKE_PINATA_BRANCH=main
ADD "https://api.github.com/repos/drips-network/fake-pinata/commits/${FAKE_PINATA_BRANCH}?per_page=1" latest_commit
RUN git clone --branch ${FAKE_PINATA_BRANCH} --single-branch https://github.com/drips-network/fake-pinata.git

WORKDIR /app/fake-pinata
RUN npm ci
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
