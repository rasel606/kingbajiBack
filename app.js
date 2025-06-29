

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
const cron = require('node-cron');


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



app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
// app.use(cors({
//   origin: ['https://kingbaji.live', 'https://www.fwick7ets.xyz'],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
// }));

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

app.use("/proxy", (req, res) => {
  const targetUrl = req.query.url;
  req.pipe(request(targetUrl)).pipe(res);
});


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
    .then(() => {console.log("✅ Connected to MongoDB"); })
    .catch((error) => console.error("❌ MongoDB Connection Error:", error));

// ✅ Security Middleware

const BettingHistoryJob = require('./src/corn/BettingHistoryJob');
const rewardProcessor = require('./src/Services/rewardProcessor');
// const chatSocketHandler = require('./src/Healper/chatSocketHandler');
const TurnOverJob = require('./src/corn/TurnOverJob');
const weeklyLossBonusCrons = require('./src/corn/weeklyLossBonusCron');
const calculateDailyRebates = require('./src/corn/calculateDailyRebates');
// const referralController = require('./src/Controllers/referralController');
// ✅ Basic Route for Testing
app.get('/', (req, res) => {
    console.log('✔️ API Running');
    res.json({ message: "API is working!" });
});



// cron.schedule('10 1 * * *', async () => {
//   console.log("processDailyRewards Cron job started at", new Date());
//   await processDailyRewards();
// });
// const calculateReferralBonus = require('./src/Services/rewardProcessor');
// const calculateDailyCashback = require('./src/corn/dailyCashbackCron');

// // Run every day at 3:00 AM (GMT+6)
// cron.schedule('0 21 * * *', async () => {
//   console.log("🚀 Starting Referral and Cashback Cron Jobs...");
//   await calculateReferralBonus();
//   await calculateDailyCashback();
// });


// cron.schedule('* * * * *', async () => {
//   console.log("Running Daily Slot Rebate Job...");
//   await calculateDailyRebates();
//   console.log("Slot Rebate Job Completed.",calculateDailyRebates);
//   console.log("Slot Rebate Job Completed.");
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
