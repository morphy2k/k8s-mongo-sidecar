FROM node:alpine
LABEL maintainer Markus Wiegand <mail@morphy2k.io>

ENV NODE_ENV=production

WORKDIR /opt/morphy2k/k8s-mongo-sidecar

COPY package.json package-lock.json /opt/morphy2k/k8s-mongo-sidecar/

RUN npm install

COPY ./src /opt/morphy2k/k8s-mongo-sidecar/src

CMD ["npm", "start"]
