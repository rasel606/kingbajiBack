const express = require('express');
const router = require('./src/Router/Api');
const axios = require("axios");
const mongoose = require('mongoose');
const { createProxyMiddleware } = require('http-proxy-middleware');
const mongoSanitize = require('express-mongo-sanitize');
const cors = require('cors');
const dotenv = require("dotenv");

dotenv.config();
const app = express();

// ✅ Middleware Setup
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ CORS Configuration
app.use(cors({
    origin: "*", // Change to your frontend URL in production
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle Preflight Requests
app.options('*', cors());

// ✅ MongoDB Setup
const URI =  `mongodb+srv://bajicrick247:bajicrick24@cluster0.jy667.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.connect(URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((error) => console.error("❌ MongoDB Connection Error:", error));

// ✅ Security Middleware
app.use(mongoSanitize());

// ✅ Basic Route for Testing
app.get('/', (req, res) => {
    console.log('✔️ API Running');
    res.json({ message: "API is working!" });
});

// ✅ Proxy Setup (For Third-Party API Requests)
app.use('/proxy', createProxyMiddleware({
    target: 'http://147.93.108.184:3128', // Proxy Server
    changeOrigin: true,
    secure: false,
    auth: 'root:0000', // Proxy authentication
    pathRewrite: { '^/proxy': '' },
    logLevel: 'debug',
    onProxyRes: (proxyRes) => {
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    }
}));

// Function to handle the proxy requests
// app.use('/proxy', async (req, res) => {
//     try {
//         // Anonymize the proxy URL
//         const anonymizedProxy = await anonymizeProxy(proxyUrl);

//         // Set up the proxied request
//         const proxiedRequest = await fetch(anonymizedProxy, {
//             method: req.method,
//             headers: req.headers,
//             body: req.body
//         });

//         proxiedRequest.pipe(res);
//     } catch (error) {
//         console.error('Proxy Error:', error);
//         res.status(500).json({ error: 'Error with proxy service' });
//     }
// });

// Route Handlers
app.use("/api/v1", router);

app.get("/api/v2", (req, res) => {
    console.log('API v2 is running');
    res.json('API v2 is running');
});

// Handle 404 for unknown routes
app.use("*", (req, res) => {
    res.status(404).json({ status: "Fail", data: "Data not found" });
});

// Export the Express app
module.exports = app;
