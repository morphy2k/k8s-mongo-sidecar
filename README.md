# Mongo Kubernetes Replica Set Sidecar

This project is as a PoC to setup a MongoDB replica set using Kubernetes. It should handle resizing of any type and be resilient to the various conditions both MongoDB and Kubernetes can find themselves in.

It's a fork of [cvallance/mongo-k8s-sidecar](https://github.com/cvallance/mongo-k8s-sidecar) with (many) changes and improvements.

## How to use it

The docker image is hosted on Docker Hub and can be found here:
[https://hub.docker.com/r/morphy/k8s-mongo-sidecar](https://hub.docker.com/r/morphy/k8s-mongo-sidecar)

An example Kubernetes replication controller can be found in the examples directory on GitHub:
[https://github.com/morphy2k/k8s-mongo-sidecar](https://github.com/morphy2k/k8s-mongo-sidecar)


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
| MONGO_SSL | NO | false | Enable MongoDB SSL connection |
| MONGO_SSL_CA | NO | | Path to SSL CA Certificate |
| MONGO_SSL_CERT | NO | | Path to SSL Certificate |
| MONGO_SSL_KEY | NO | | Path to SSL Key |
| MONGO_SSL_PASS | NO | | SSL Certificate pass phrase |
| MONGO_SSL_CRL | NO | | Path to SSL Certificate revocation list |
| MONGO_SSL_IDENTITY_CHECK | NO | true | Server identity check during SSL. Checks server's hostname against the certificate |
| SIDECAR_SLEEP_SECONDS | NO | 5 | This is how long to sleep between work cycles. |
| SIDECAR_UNHEALTHY_SECONDS | NO | 15 | This is how many seconds a replica set member has to get healthy before automatically being removed from the replica set. |

#### MongoDB SSL
The following is an example of how you would update the mongo command enabling SSL and using a certificate obtained from a secret and mounted at `/data/ssl/mongo/`

Command
```yaml
        - name: my-mongo
          image: mongo
          command:
            - mongod
          args:
            - "--replSet=rs0"
            - "--sslMode=requireSSL"
            - "--sslCAFile=/var/run/secrets/kubernetes.io/serviceaccount/ca.crt"
            - "--sslPEMKeyFile=/data/ssl/mongo/combined.pem"
            - "--smallfiles"
            - "--noprealloc"
            - "--bind_ip=0.0.0.0"
```

Environment variables, Volume & Volume Mounts
```yaml
          volumeMounts:
            - name: mongo-persistent-storage
              mountPath: /data/db
            - name: mongo-ssl
              mountPath: /data/ssl/mongo
        - name: mongo-sidecar
          image: cvallance/mongo-k8s-sidecar:latest
          env:
            - name: KUBERNETES_POD_LABELS
              value: "role=mongo,environment=prod"
            - name: MONGO_SSL
              value: "true"
            - name: MONGO_SSL_CA
              value: "/var/run/secrets/kubernetes.io/serviceaccount/ca.crt"
            - name: "MONGO_SSL_CERT"
              value: "/data/ssl/mongo/cert.pem"
            - name: MONGO_SSL_KEY
              value: "/data/ssl/mongo/key.pem"
          volumeMounts:
            - name: mongo-ssl
              mountPath: /data/ssl/mongo
      volumes:
        - name: mongo-ssl
          secret:
            secretName: mongo-ssl
            defaultMode: 256 # file permission 0400
```

#### Creating Secret for SSL

1.  Generate a certificate with your Kubernetes cluster as CA that is explained [here](https://kubernetes.io/docs/tasks/tls/managing-tls-in-a-cluster/)
2.  Merge your certificate and key named as `cert.pem` and `key.pem` into a single file
```bash
cat cert.pem key.pem > combined.pem
```
3.  Push the secrets to your cluster
```bash
kubectl create secret generic mongo-ssl \
--from-file=combined.pem \
--from-file=key.pem \
--from-file=cert.pem
```
