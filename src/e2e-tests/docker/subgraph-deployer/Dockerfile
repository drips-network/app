FROM node:20-alpine3.16

RUN apk update
RUN apk add netcat-openbsd
RUN apk add bash
RUN apk add curl
RUN apk add git

COPY ./src/e2e-tests/docker/scripts scripts
RUN ["chmod", "+x", "/scripts/clone-subgraph.sh"]

RUN bash /scripts/clone-subgraph.sh

CMD bash /scripts/deploy-subgraph.sh
