FROM node:20-alpine3.16

RUN apk update
RUN apk add netcat-openbsd
RUN apk add bash
RUN apk add curl
RUN apk add git

ADD "https://api.github.com/repos/drips-network/subgraph/commits?per_page=1" latest_commit
COPY ./services/subgraph-deployer/scripts scripts
RUN ["chmod", "+x", "/scripts/clone-subgraph.sh"]

ARG CACHEBUST=1
RUN bash /scripts/clone-subgraph.sh

CMD bash /scripts/deploy-subgraph.sh
