#!/bin/bash
node load-balancer.js 3000
npm start 8001 &
npm start 8002 &
npm start 8003 &
npm start 8004 &