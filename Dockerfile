FROM node:alpine

WORKDIR /app

COPY . .
RUN npm ci
RUN npm install --no-save turndown-plugin-gfm@^1.0.2

WORKDIR /src

ENTRYPOINT ["node", "/app/bin/turndown-cli.js"]
