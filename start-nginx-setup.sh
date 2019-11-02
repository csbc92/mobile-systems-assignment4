#!/bin/bash

# Start the nginx load-balancer (port 3000)
cd nginx
./start-nginx-load-balancer.sh

# Start the node web servers
cd ..
./start-node-servers.sh
