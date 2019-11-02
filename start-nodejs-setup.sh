#!/bin/bash
node load-balancer.js 3000 &
./start-node-servers.sh