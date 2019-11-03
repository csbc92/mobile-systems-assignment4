# Architectural protoype of trajectory filtering API with load-balancing
This repository contains an executable architectural prototype for a trajectory filtering API supported by multiple web servers (nodes) with a load-balancer in front.

The purpose of the prototype is to see if performance (i.e. latency, requests pr. second) scales as more web servers are added to the system.

**Major Components**:
1. Web API for filtering trajectory data, exposed through NodeJS
2. Load-balancers; one uses NodeJS while the other uses Nginx. There are two different load-balancers for testing purposes i.e. to see which performs better for this prototype.
3. Performance tests written for artillery.io to measure if there are any performance gains by introducing a load-balancer.

# Prerequisites
* Docker (for nginx)
* NodeJS environment
* Any *nix environment


# Setting up the config files
## NodeJS trajectory filtering API
Nodes can be started manually by issuing `npm start <port>`. The default start script for the trajectory API are located here: `start-node-servers.sh`. Modify this to match your requirements i.e. the number of nodes and which ports they use.

```bash
#!/bin/bash
# Add more nodes here as necessary
npm start 8001 &  <--- Change the port
npm start 8002 &  <--- Change the port
npm start 8003 &  <--- Change the port
npm start 8004 &  <--- Change the port
```

## Load balancers
Use either NodeJS or Nginx. Not both at the same time (even though it is possible).

### NodeJS load balancer (not used for the performance test)
The default port number `3000` can be changed in the script `start-nodejs-setup.sh`

```
#!/bin/bash
node load-balancer.js 3000 &  <--- Change the port
./start-node-servers.sh
```

The pool of available web servers should be set in `load-balancer.js`.
```js
/* eslint-env es6, node */

/**
 * Code originally by Ross Johnson
 * Introduction to Load Balancing using Node.js - Part 1
 * https://mazira.com/blog/introduction-load-balancing-nodejs
 */
let arguments = process.argv.splice(2);
let http      = require('http');
let httpProxy = require('http-proxy');

//
// Addresses to use in the round robin proxy
//
let addresses = [
    { target: 'http://localhost:8001' },  <-- Change the server addresses
    { target: 'http://localhost:8002' },
    { target: 'http://localhost:8003' },
    { target: 'http://localhost:8004' }
];

// ..
```

### Nginx load balancer
The file `nginx/etc/nginx/conf.d/load-balancer.conf` contains the configuration for the nginx load-balancer. Change the configuration to include the IP:PORT to match your web servers. If necessary change the default port 80 used by the load-balancer.

```
upstream trajectoryapi {
    least_conn;
    server 192.168.0.3:8001;  <-- Change address:port to match your IP for the web api
    server 192.168.0.3:8002;  <-- Change address:port to match your IP for the web api
    server 192.168.0.3:8003;  <-- Change address:port to match your IP for the web api
    server 192.168.0.3:8004;  <-- Change address:port to match your IP for the web api
}

server {
    listen 80;

    location / {
        proxy_pass http://trajectoryapi;
    }
}
```

The nginx start script `nginx/start-nginx-load-balancer.sh` can be configured to use different external and internal port numbers. Change these from the default ports if they are occupied by your system.

If you changed the default port 80 used by the nginx load-balancer, be sure to change the `INTERNALPORT` to match.

```bash
#!/bin/bash
EXTERNALPORT=3000
INTERNALPORT=80
NAME="load-balancer"
docker run --name $NAME -p $EXTERNALPORT:$INTERNALPORT -v $PWD/html:/usr/share/nginx/html:ro -v $PWD/etc/nginx:/etc/nginx:ro -d nginx

```

## Artillery.io performance test
The test itself is written in YAML for artillery.io. The `target` in the YAML file `tests/performance-test.yml` must be set to match the IP:PORT of the load-balancer.

```yaml
config:
  target: 'http://192.168.0.4:3000' # Target server with the trajectory API
  
  //... 
```
* The performance test can be run once by issuing `tests/run-test.sh`. The output of the test is in the directory `tests/out`, or
* the performance test can be run automatically for 1-n nodes with the use of the script `tests/automatic-remote-test.sh`. With this script it is possible to configure the server remotely over `ssh`. This methods requires that you have generated ssh-keys so that you can connect to the server without entering passwords. The script will copy the configs from the folder `tests/nginx-confs`. The IPs in this folder can be changed at once with the command `sed -i 's/old-ip/new-ip/g' *` - for example if you want to replace localhost with 192.168.0.10:`sed -i 's/localhost/192.168.0.10/g' *`

# Results
