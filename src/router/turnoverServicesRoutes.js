
const express = require('express');
const { body,query } = require('express-validator');
const turnOverServices = require('../services/turnOverServices');
const {auth} = require('../MiddleWare/auth');
const validate = require('../MiddleWare/validation');

const router = express.Router();

// // Search transactions
router.get('/checkWithdrawalEligibility/active',  auth, turnOverServices.checkPromotionsEligibilityActive);
router.get('/checkWithdrawalEligibility/complate',  auth, turnOverServices.checkPromotionsComplated);
router.get('/checkWithdrawalEligibility',  auth, turnOverServices.checkPromotionsEligibility);
// router.get('/search_widthrawal_getways', validate, auth, AdminController.WidthrawalGetWayList);



module.exports = router;