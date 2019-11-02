#!/bin/bash
docker stop load-balancer
docker rm load-balancer
killall node
