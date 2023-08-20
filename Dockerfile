FROM node:20.5.0-alpine

ENV INTERVAL 3600

WORKDIR /opt/godaddy-dynamic-dns

COPY godaddy-dynamic-dns-daemon.sh auth.json config.json package.json ./
RUN mkdir src
COPY src/godaddy.mjs ./src
COPY src/log.mjs ./src
COPY src/index.mjs ./src

RUN npm install

CMD ["./godaddy-dynamic-dns-daemon.sh"]
