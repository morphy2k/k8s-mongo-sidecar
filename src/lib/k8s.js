'use strict';

const Client = require('kubernetes-client').Client;
const clientConfig = require('kubernetes-client').config;

const config = require('./config');


const client = new Client({ config: clientConfig.getInCluster() });

const init = async() => {
  return await client.loadSpec();
};

const getMongoPods = async() => {
  try {
    const res = await client.api.v1.namespaces(config.k8sNamespace)
      .pods.get({ qs: { labelSelector: config.k8sMongoPodLabels } });
    return res.body.items;
  } catch (err) {
    return Promise.reject(err);
  }
};

module.exports = {
  init,
  getMongoPods
};
