FROM node:lts-slim
LABEL maintainer Markus Wiegand <mail@morphy2k.dev>

ENV NODE_ENV=production

WORKDIR /opt/k8s-mongo-sidecar

COPY package.json package-lock.json /opt/k8s-mongo-sidecar/

RUN npm install

COPY ./src /opt/k8s-mongo-sidecar/src

CMD ["npm", "start"]
