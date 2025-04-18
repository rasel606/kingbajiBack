

const express = require('express');
const router = require('./src/Router/Api');
const axios = require("axios");
const mongoose = require('mongoose');
const { createProxyMiddleware } = require('http-proxy-middleware');
const mongoSanitize = require('express-mongo-sanitize');
const cors = require('cors');
const dotenv = require("dotenv");
const  cookieHandler  = require('./src/MiddleWare/cookieMiddleware');
const cookieParser = require( 'cookie-parser' );
dotenv.config();
const app = express();

// ✅ Middleware Setup
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cookieHandler);

// app.use(cors());
app.use(mongoSanitize());


// Only allow specific origin (localhost for development)

// const allowedOrigins = process.env.NODE_ENV === 'production' 
//   ? ['https://kingbaji.live'] 
//   : ['http://localhost:3000', 'https://kingbaji.live'];

// const corsOptions = {
//   origin: allowedOrigins,
//   credentials: true,
//   exposedHeaders: ['Content-Length', 'Content-Range'],
// };

// app.use(cors(corsOptions));

app.use(cors({
  origin: ['https://kingbaji.live', 'https://www.fwick7ets.xyz'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ✅ API Routes

// Enhanced proxy middleware
app.use('/apiWallet', createProxyMiddleware({
    target: 'https://www.fwick7ets.xyz',
    changeOrigin: true,
    pathRewrite: { '^/apiWallet': '/apiWallet' },
    secure: false,
    onProxyRes: (proxyRes, req, res) => {
        // Remove duplicate CORS headers
        delete proxyRes.headers['access-control-allow-origin'];
        delete proxyRes.headers['Access-Control-Allow-Origin'];
    },
    cookieDomainRewrite: {
        "www.fwick7ets.xyz": "localhost" // For development
    },
    onProxyRes: (proxyRes, req, res) => {
        // Ensure only one Access-Control-Allow-Origin header is set
        if (proxyRes.headers['access-control-allow-origin']) {
            delete proxyRes.headers['access-control-allow-origin'];
        }
        if (proxyRes.headers['Access-Control-Allow-Origin']) {
            delete proxyRes.headers['Access-Control-Allow-Origin'];
        }
    }
}));


app.use((err, req, res, next) => {
    console.error('[Global Error]', err);
    res.status(500).json({ 
      errCode: 500, 
      errMsg: 'Internal server error' 
    });
  });

// Handle Preflight Requests


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
