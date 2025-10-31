
// routes/transactionRoutes.js
const express = require('express');
const { body, query } = require('express-validator');
const SubAdminControllers = require('../Controllers/SubAdminControllers');
const AdminController = require('../Controllers/AdminController');
const AgentController = require('../Controllers/AgentController');
const auth = require('../MiddleWare/subAdminAuth');
const validate = require('../MiddleWare/validation');

const router = express.Router();

// Search transactions
router.get('/get_UserList', validate, auth, AgentController.GetUserList);
router.get('/get_user_list_by_role', validate, auth, AgentController.getTransactionList);




module.exports = router;