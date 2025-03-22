const https = require('https');
const fs = require('fs');
const app = require('./app');

const sslOptions = {
    key: fs.readFileSync('/etc/letsencrypt/live/kingbaji.live/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/kingbaji.live/fullchain.pem')
};

https.createServer(sslOptions, app).listen(443, '0.0.0.0', () => {
    console.log('HTTPS server running on port 443');
});