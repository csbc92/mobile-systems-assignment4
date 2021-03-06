#!/bin/bash
SERVER=192.168.0.13
USERNAME=ccl
GITREPO=/home/$USERNAME/git/mobile-systems-assignment4

# Make sure everything is stopped
ssh $USERNAME@$SERVER "(cd $GITREPO; ./stop-all.sh)"

# For the amount of nodes to test with
for i in {2..8}
do
    # Overwrite the nginx config with the amount of nodes
    ssh $USERNAME@$SERVER "rm -fr $GITREPO/nginx/etc/nginx/conf.d/*" # Clear the conf folder
    ssh $USERNAME@$SERVER "(cd $GITREPO/tests/nginx-confs; cp load-balancer$i.conf $GITREPO/nginx/etc/nginx/conf.d)"

    # Start the amount of node js nodes from port 8001-800n
    for j in $(seq 1 $i)
    do
        # Execute on server
        ssh -n -f $USERNAME@$SERVER "sh -c 'cd $GITREPO; nohup npm start 800$j > /dev/null 2>&1 &'"
    done

    # Start the nginx load balancer
    ssh $USERNAME@$SERVER "(cd $GITREPO/nginx; ./start-nginx-load-balancer.sh)"

    # Perform the artillery test against the server
    hostname
    ./run-test.sh

    # Create the directory stamped with date
    cd $GITREPO/tests;
    mkdir out/$(date +%Y-%m-%d)
    # Move the output from the test to the correct folder
    mv out/report.html out/$(date +%Y-%m-%d)/"report-"$i"-instances.html"

    # Leave a clean environment 
    ssh $USERNAME@$SERVER "(cd $GITREPO; ./stop-all.sh)"
done
    