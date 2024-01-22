FROM node:20-alpine3.16

RUN apk add --no-cache git
RUN apk add --no-cache curl

WORKDIR /app

ARG GQL_API_BRANCH=main
ADD "https://api.github.com/repos/drips-network/graphql-api/commits/${GQL_API_BRANCH}?per_page=1" latest_commit
RUN git clone --branch ${GQL_API_BRANCH} --single-branch https://github.com/drips-network/graphql-api.git

WORKDIR /app/graphql-api
COPY ./services/drips-gql-api/envfile .env.local

RUN npm ci
RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "start:local"]
