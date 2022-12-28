"use strict";
const k8s = require("@kubernetes/client-node");
const config = require("./config");

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const client = kc.makeApiClient(k8s.CoreV1Api);

const init = async () => {
    console.log("k8s client init done");
};

const getMongoPods = async () => {
    try {
        const res = await client.listNamespacedPod(
            config.k8sNamespace,
            undefined,
            undefined,
            undefined,
            undefined,
            config.k8sMongoPodLabels
        );
        return res.body;
    } catch (err) {
        return Promise.reject(err);
    }
};

module.exports = {
    init,
    getMongoPods,
};
