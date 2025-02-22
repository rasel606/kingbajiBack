// // index.js
// const https = require('https');
const http = require('http');
// const fs = require('fs');
const app = require('./app'); // Import the main application
// const { Server } = require("socket.io");
// HTTPS server options
// const httpsOptions = {
//     key: fs.readFileSync('./security/cert.key'),
//     cert: fs.readFileSync('./security/cert.pem')
// };

// // Create an HTTPS server
// const httpsServer = https.createServer(httpsOptions, app);

// // HTTPS server listens on port 443 (default HTTPS port)
// httpsServer.listen(443, () => {
//     console.log('HTTPS server running on https://localhost:443');
// });

// // Create an HTTP server for fallback (or to redirect to HTTPS)
// const httpServer = http.createServer(app);

// // Redirect HTTP to HTTPS
// app.use((req, res, next) => {

//     if (req.protocol !== 'https') {
//         return res.redirect('https://' + req.headers.host + req.url);
//     }
//     next();
// });

// // const io = new Server(httpsServer, { cors: { origin: "*" } });




// // io.on("connection", (socket) => {
//     console.log("New user connected:", socket.id);

//     socket.on("sendMessage", (data) => {
//         io.to(data.receiver).emit("receiveMessage", data);
//     });

//     socket.on("disconnect", () => {
//         console.log("User disconnected");
//     });
// });



// HTTP server listens on port 5000
app.listen(5000, () => {
    console.log('HTTP server running on http://localhost:5000');
});

