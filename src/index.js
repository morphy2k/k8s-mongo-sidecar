'use strict';

const worker = require('./lib/worker');


console.log('Starting up k8s-mongo-sidecar');

worker.init()
  .then(worker.workloop)
  .catch(err => console.error('Error trying to initialize k8s-mongo-sidecar', err));
