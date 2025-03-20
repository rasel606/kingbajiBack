const { HttpsProxyAgent } = require('https-proxy-agent');

// Configure the proxy agent with your VPS proxy
const proxyAgent = new HttpsProxyAgent('http://147.93.108.184:3128');

module.exports = proxyAgent;
