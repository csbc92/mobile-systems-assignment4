#!/bin/bash

# Output the JSON result (raw data) to out/result.json
# and create an HTML report based on the raw file. 
artillery run performance-test.yml -o out/result.json
artillery report -o out/report.html out/result.json