FROM node:8-alpine
LABEL maintainer Markus Wiegand <mail@morphy2k.io>

ENV NODE_ENV=production

WORKDIR /opt/k8s-mongo-sidecar

COPY package.json package-lock.json /opt/k8s-mongo-sidecar/

RUN npm install

COPY ./src /opt/k8s-mongo-sidecar/src

CMD ["npm", "start"]
