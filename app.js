
// const express = require('express');
// const router = require('./src/Router/Api');


// // const app = new express()



// //middleware
// //middleware
// // Middleware
// // const rateLimit = require('express-rate-limit');
// // const helmet = require('helmet');
// const mongoose = require('mongoose');

// const mongoSanitize = require('express-mongo-sanitize');
// const cors = require('cors');


// // Middleware setup
// app.use(express.static("public"));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cors({
//     origin: '*',
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// }));



// app.use(mongoSanitize());
// // app.use(helmet());

// app.set('trust proxy', true);



// // const limiter = rateLimit({
// //     windowMs: 150 * 60 * 1000,
// //     max: 1000,
// //     standardHeaders: true,
// //     legacyHeaders: false,
// // })
// // const limiter = rateLimit({
// // 	validate: {
// // 		validationsConfig: false,
// // 		// ...
// // 		default: true,
// // 	},
// // 	// ...
// // })


// // app.use(limiter)


// //mongodb database connection


// let URI = `mongodb+srv://bajicrick247:bajicrick24@cluster0.jy667.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

// // Route


// mongoose.connect(URI,)
//     .then(() => { console.log("connect") })
//     .catch((error) => {


//     })











// app.use("/api/v1", router);


// // app.use("*", (req, res) => {
// //     res.status(404).json({ status: "Fail", data: "Data not found" })
// // });



// module.exports = app

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


// const allowedOrigins = ['http://localhost:3000', 'https://kingbaji.live', 'https://www.fwick7ets.xyz'];


app.use(cors({
    origin: "http://localhost:3000", // Change to your frontend URL in production
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));


// const allowedOrigins = ['http://localhost:3000', 'https://kingbaji.live'];

// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin) return callback(null, true); // allow requests with no origin (like mobile apps, curl, etc.)
//     if (allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     } else {
//       return callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true
// }));

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
