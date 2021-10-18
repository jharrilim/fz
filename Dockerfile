FROM node:16-slim as builder
WORKDIR /app
COPY frontend .

WORKDIR /app/frontend
RUN yarn && yarn build

WORKDIR /app
COPY package.json .
COPY yarn.lock .
RUN yarn && yarn build:production

FROM node:16-slim as release
WORKDIR /app
COPY --from=builder /app/dist .
CMD [ "node", "." ]
