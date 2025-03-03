const express = require('express');
const router = require('./src/Router/Api');

require('dotenv').config();

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
const cors = require('cors');

app.use(cors({
    origin: ['https://kingbaji365.live'], // Explicitly allow frontend
    credentials: true, // Allow cookies/auth headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
}));


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Change * to specific domain if needed
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// app.get('/', function (req, res) {
//     res.sendFile(path.join(__dirname, 'build', 'index.html'));
//   });
  


const connectedUsers = {};





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


app.use("/", (req, res) => {
    res.status(404).json({ status: "success", data: "Data  found" })
});



module.exports = app