// routes/paymentMethods.js
const express = require('express');
const router = express.Router();
const paymentMethodController = require('../Controllers/paymentMethodController');

const { auth } = require('../MiddleWare/auth');

router.get("/available-methods", 
    auth, 
    (req, res, next) => {
        userId = req.user;
        console.log("User ID:", userId);
        next();
    },
    paymentMethodController.GetUserPayMethods
);
router.get("/transactions_history", 
    auth, 
    (req, res, next) => {
        userId = req.user;
        console.log("User ID:", userId);
        next();
    },
    paymentMethodController.getTransactions
);
module.exports = router;