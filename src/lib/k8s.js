"use strict";

const { Client, KubeConfig } = require("kubernetes-client");
const Request = require("kubernetes-client/backends/request");

const config = require("./config");

const kubeconfig = new KubeConfig();
kubeconfig.loadFromCluster();

const client = new Client({
    backend: new Request({ kubeconfig }),
    version: "1.13",
});

const init = async () => {
    return await client.loadSpec();
};

const getMongoPods = async () => {
    try {
        const res = await client.api.v1
            .namespaces(config.k8sNamespace)
            .pods.get({ qs: { labelSelector: config.k8sMongoPodLabels } });
        return res.body.items;
    } catch (err) {
        return Promise.reject(err);
    }
};

module.exports = {
    init,
    getMongoPods,
};
