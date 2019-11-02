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

```
#!/bin/bash
# Add more nodes here as necessary
npm start 8001 &  <--- Change the port
npm start 8002 &  <--- Change the port
npm start 8003 &  <--- Change the port
npm start 8004 &  <--- Change the port
```

## Load balancers
Use either NodeJS or Nginx. Not both at the same time (even though it is possible).

### NodeJS load balancer
The default port number `3000` can be changed in the script `start-nodejs-setup.sh`

```
#!/bin/bash
node load-balancer.js 3000 &  <--- Change the port
./start-node-servers.sh
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

```
config:
  target: 'http://192.168.0.4:3000' # Target server with the trajectory API
  
  //... 
```
The performance test can be run by issuing `tests/run-test.sh`. The output of the test is in the directory `tests/out`