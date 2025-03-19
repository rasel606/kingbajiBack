const express = require('express');
const router = require('./src/Router/Api');
const axios = require("axios");
const path = require("path");
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
    origin:["https://kingbajiback.onrender.com","https://www.fwick7ets.xyz","http://localhost:3000"], // Allow only your frontend origin
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: 'Content-Type, Authorization'
}));

app.get('/', function (req, res) {
    console.log('index.html');
    res.json('index.html');
  });
  


// ✅ Proxy Route (Forwards Requests via Indian Proxy)
// app.use('/proxy', async (req, res) => {
//     const targetUrl = req.query.url;

//     if (!targetUrl) {
//         return res.status(400).json({ error: "Missing target URL" });
//     }

//     try {
//         const response = await axios({
//             method: req.method,
//             url: targetUrl,
//             headers: { ...req.headers },
//             data: req.body,
//             proxy: PROXY_CONFIG, // 🔥 Uses Indian Proxy
//             timeout: 10000 // 10s timeout
//         });

//         res.json(response.data);
//     } catch (error) {
//         console.error("Proxy Error:", error.message);
//         res.status(500).json({ error: "Proxy request failed" });
//     }
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



app.use("/js", express.static(path.join(__dirname, "public", "js"), {
    setHeaders: (res) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    }
}));

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