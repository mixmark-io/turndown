FROM node:alpine

WORKDIR /app

COPY . .
RUN npm ci

WORKDIR /src

ENTRYPOINT ["node", "/app/bin/turndown-cli.js"]
