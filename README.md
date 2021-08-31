![Lint](https://github.com/morphy2k/k8s-mongo-sidecar/workflows/Lint/badge.svg)

**This repository only gets important security updates. I recommend to use the [Kubernetes Operator](https://github.com/mongodb/mongodb-kubernetes-operator) in the future.**

# Mongo Kubernetes Replica Set Sidecar

This project is as a PoC to setup a MongoDB replica set using Kubernetes. It should handle resizing of any type and be resilient to the various conditions both MongoDB and Kubernetes can find themselves in.

*It's a fork of [cvallance/mongo-k8s-sidecar](https://github.com/cvallance/mongo-k8s-sidecar) with (many) changes and improvements.*

## How to use it

The docker image is hosted on Docker Hub and can be found here:
[https://hub.docker.com/r/morphy/k8s-mongo-sidecar](https://hub.docker.com/r/morphy/k8s-mongo-sidecar)

An example Kubernetes replication controller can be found in the examples directory on GitHub:
[https://github.com/morphy2k/k8s-mongo-sidecar](https://github.com/morphy2k/k8s-mongo-sidecar/tree/master/example)


### Settings

| Environment Variable | Required | Default | Description |
| --- | --- | --- | --- |
| KUBERNETES_CLUSTER_DOMAIN | NO | cluster.local | This allows the specification of a custom cluster domain name. Used for the creation of a stable network ID of the k8s Mongo   pods. An example could be: "kube.local". |
| KUBERNETES_SERVICE_NAME | YES | mongo | This should point to the MongoDB Kubernetes (headless) service that identifies all the pods. |
| KUBERNETES_NAMESPACE | NO |  | The namespace to look up pods in. Not setting it will search for pods in all namespaces. |
| KUBERNETES_POD_LABELS | YES |  | This should be a be a comma separated list of key values the same as the podTemplate labels. See above for example. |
| MONGO_PORT | NO | 27017 | Configures the mongo port, allows the usage of non-standard ports. |
| MONGO_CONFIG_SVR | NO | false | Configures the [configsvr](https://docs.mongodb.com/manual/reference/replica-configuration/#rsconf.configsvr) variable when initializing the replicaset. |
| MONGO_DATABASE | NO | local | Configures the mongo authentication database |
| MONGO_USERNAME | NO | | Configures the mongo username for authentication |
| MONGO_PASSWORD | NO | | Configures the mongo password for authentication |
| MONGO_AUTH_SOURCE | NO | admin | Configures the mongo database for authentication |
| MONGO_AUTH_MECHANISM | NO | SCRAM-SHA-1 | Configures the mongo authentication mechanism |
| MONGO_TLS | NO | false | Enable MongoDB TLS connection |
| MONGO_TLS_CA | NO | | Path to TLS CA Certificate |
| MONGO_TLS_CERT | NO | | Path to TLS Certificate |
| MONGO_TLS_KEY | NO | | Path to TLS Key |
| MONGO_TLS_PASS | NO | | TLS Certificate pass phrase |
| MONGO_TLS_CRL | NO | | Path to TLS Certificate revocation list |
| MONGO_TLS_IDENTITY_CHECK | NO | true | Server identity check during TLS. Checks server's hostname against the certificate |
| SIDECAR_SLEEP_SECONDS | NO | 5 | This is how long to sleep between work cycles. |
| SIDECAR_UNHEALTHY_SECONDS | NO | 30 | This is how many seconds a replica set member has to get healthy before automatically being removed from the replica set. |

#### MongoDB TLS
The following is an example of how you would update the mongo command enabling TLS and using a certificate obtained from a secret and mounted at `/data/tls/mongo/`

Command
```yaml
        - name: my-mongo
          image: mongo
          command:
            - mongod
          args:
            - "--replSet=rs0"
            - "--tlsMode=requireTLS"
            - "--tlsCAFile=/var/run/secrets/kubernetes.io/serviceaccount/ca.crt"
            - "--tlsCertificateKeyFile=/data/tls/mongo/full.pem"
            - "--bind_ip=0.0.0.0"
```

Environment variables, Volume & Volume Mounts
```yaml
          volumeMounts:
            - name: mongo-persistent-storage
              mountPath: /data/db
            - name: mongo-tls
              mountPath: /data/tls/mongo
        - name: mongo-sidecar
          image: morphy/k8s-mongo-sidecar
          env:
            - name: KUBERNETES_POD_LABELS
              value: "role=mongo,environment=prod"
            - name: MONGO_TLS
              value: "true"
            - name: MONGO_TLS_CA
              value: "/var/run/secrets/kubernetes.io/serviceaccount/ca.crt"
            - name: "MONGO_TLS_CERT"
              value: "/data/tls/mongo/cert.pem"
            - name: MONGO_TLS_KEY
              value: "/data/tls/mongo/key.pem"
          volumeMounts:
            - name: mongo-tls
              mountPath: /data/tls/mongo
      volumes:
        - name: mongo-tls
          secret:
            secretName: mongo-tls
            defaultMode: 256 # file permission 0400
```

#### Creating Secret for TLS

1.  Generate a certificate with your Kubernetes cluster as CA that is explained [here](https://kubernetes.io/docs/tasks/tls/managing-tls-in-a-cluster/)
2.  Merge your certificate and key named as `cert.pem` and `key.pem` into a single file
```bash
cat cert.pem key.pem > full.pem
```
3.  Push the secrets to your cluster
```bash
kubectl create secret generic mongo-tls \
--from-file=full.pem \
--from-file=key.pem \
--from-file=cert.pem
```
