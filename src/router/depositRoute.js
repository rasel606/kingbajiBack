// routes/subAdminRoutes.js
const express = require('express');
const { body } = require('express-validator');
const {depositInitiate, depositConfirm, depositHistory} = require('../Services/depositServices');
const auth = require('../MiddleWare/subAdminAuth');
const validate = require('../MiddleWare/validation');

const router = express.Router();

// Dashboard statistics

router.post('/deposit/initiate', auth, depositInitiate);
router.post('/deposit/confirm', auth, depositConfirm);
router.get('/deposit/history/:userId', auth, depositHistory);



module.exports = router;
