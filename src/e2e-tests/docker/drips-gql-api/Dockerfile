FROM node:20-alpine3.16

RUN apk add --no-cache git

WORKDIR /app

RUN git clone https://github.com/drips-network/graphql-api.git

WORKDIR /app/graphql-api
COPY ./src/e2e-tests/docker/drips-gql-api/envfile .env.local

RUN npm ci
RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "start:local"]
