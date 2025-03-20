
const app = require('./app'); // Import the main application


const fs = require('fs');
const https = require('https');




// const options = {
//   key: fs.readFileSync('/path/to/your/ssl/key.pem'),
//   cert: fs.readFileSync('/path/to/your/ssl/cert.pem')
// };

// https.createServer(options, app).listen(5000, () => {
//   console.log('HTTPS Server running on port 5000');
// });



// const http = require('http');

// const httpServer = http.createServer(app);


// httpServer.listen(5000, () => {
//     console.log('Server running on http://localhost:5000');
// });
app.listen(5000, "0.0.0.0", () => {
    console.log("Server running on IPv4 at port 5000");
  });

