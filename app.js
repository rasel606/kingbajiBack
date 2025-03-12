const express = require('express');
const router = require('./src/Router/Api');


const app = new express()



//middleware
//middleware
// Middleware
// const rateLimit = require('express-rate-limit');
// const helmet = require('helmet');
const mongoose = require('mongoose');

const mongoSanitize = require('express-mongo-sanitize');
const cors = require('cors');


// Middleware setup
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin:['https://kingbajiback-1.onrender.com'], // Allow only your frontend origin
    credentials: true, // Allow cookies and authentication headers,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.get('/', function (req, res) {
    console.log('index.html');
    res.json('index.html');
  });
  
// const winston = require('winston');

// const logger = winston.createLogger({
//   level: 'info',
//   transports: [
//     new winston.transports.Console({
//       format: winston.format.combine(
//         winston.format.colorize(),
//         winston.format.timestamp(),
//         winston.format.simple()
//       )
//     }),
//     new winston.transports.File({ filename: 'app.log' })
//   ]
// });

// app.use((req, res, next) => {
//   logger.info(`Request URL: ${req.originalUrl} - Method: ${req.method} - IP: ${req.ip}`);
//   next();
// });

const connectedUsers = {};

// router.use((req, res, next) => {
//     res.setHeader("Access-Control-Allow-Origin", "https://kingbaji365.live");
//     res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
//     res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//     res.setHeader("Access-Control-Allow-Credentials", "true");
//     next();
// });



app.use(mongoSanitize());
// app.use(helmet());

app.set('trust proxy', true);





let URI = `mongodb+srv://bajicrick247:bajicrick24@cluster0.jy667.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

// Route


mongoose.connect(URI,)
    .then(() => { console.log("connect") })
    .catch((error) => {


    })



app.use("/api/v1", router);


// app.use("*", (req, res) => {
//     res.status(404).json({ status: "Fail", data: "Data not found" })
// });



module.exports = app