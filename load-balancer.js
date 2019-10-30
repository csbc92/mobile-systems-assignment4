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
    { target: 'http://localhost:8001' },
    { target: 'http://localhost:8002' },
    { target: 'http://localhost:8003' },
    { target: 'http://localhost:8004' }
];

console.log("Round robin load balancer for the following addresses:");
console.log(addresses);

let i = 0;
let proxy = httpProxy.createProxyServer({});
proxy.on('proxyRes', function(proxyRes, req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
  });


http.createServer(function (req, res) {
    proxy.web(req, res, addresses[i]);
    i = (i + 1) % addresses.length;
}).listen(arguments[0] || 3000);

console.log("Load balancer started on port: " + arguments[0]);