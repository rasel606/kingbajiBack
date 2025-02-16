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
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));



app.use(mongoSanitize());
// app.use(helmet());

app.set('trust proxy', true);



// const limiter = rateLimit({
//     windowMs: 150 * 60 * 1000,
//     max: 1000,
//     standardHeaders: true,
//     legacyHeaders: false,
// })
// const limiter = rateLimit({
// 	validate: {
// 		validationsConfig: false,
// 		// ...
// 		default: true,
// 	},
// 	// ...
// })


// app.use(limiter)


//mongodb database connection


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