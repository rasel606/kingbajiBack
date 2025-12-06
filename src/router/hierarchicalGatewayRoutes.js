const express = require("express");
const router = express.Router();
const HierarchicalGatewayController = require("../Controllers/hierarchicalGatewayController");
const paymentMethodController = require("../Controllers/paymentMethodController");
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

module.exports = router;