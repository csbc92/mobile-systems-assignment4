#!/bin/bash
EXTERNALPORT=3000
INTERNALPORT=80
NAME="load-balancer"
docker run --name $NAME -p $EXTERNALPORT:$INTERNALPORT -v $PWD/html:/usr/share/nginx/html:ro -v $PWD/etc/nginx:/etc/nginx:ro -d nginx
