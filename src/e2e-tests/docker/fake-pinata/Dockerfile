FROM node:20-alpine3.16

RUN apk add --no-cache git

WORKDIR /app

RUN git clone https://github.com/drips-network/fake-pinata.git

WORKDIR /app/fake-pinata
RUN npm ci
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
