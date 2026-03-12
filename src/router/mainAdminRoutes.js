// routes/transactionRoutes.js
const express = require('express');
const { body, query } = require('express-validator');
const AdminController = require('../controllers/AdminController');
const BalanceTransferController = require('../controllers/BalanceTransferController');
const AdminAuth = require('../middleWare/AdminAuth');
const validate = require('../middleWare/validation');
const Usercontrollers = require('../Controllers/UserController');
const apiIntregationsController = require('../Controllers/apiIntregationsController');
const router = express.Router();

// Search transactions
// ⚠️ Temporarily disabled - pending route fix
// router.get('/New-table-categories-with-Providers', getPlayerUserGameData.getCategoriesWithProviders);
// router.get('/New-Games-with-Providers-By-Category', getPlayerUserGameData.getGamesWithProvidersByCategory);
router.get('/get_admin_affiliateList', validate, AdminAuth, AdminController.AffiliateModeladmin);
router.get('/affiliate_get_commissionSettings', validate, AdminAuth, AdminController.affiliate_get_commissionSettings);
// router.get('/get_rebate_settings', validate, AdminAuth, AdminController.getRebateSettings); // ⚠️ Disabled: Method not found in AdminController
router.get('/get_bonus_list', validate, AdminAuth, AdminController.getBonuses);
// router.get('/get_users_by_referral', validate, AdminAuth, AdminController.getUsersByReferral);
// router.get('/get_users_by_Id/:userId', validate, AdminAuth, AdminController.getUserById_detaills);
router.get('/get_categories_with_providers_and_games', validate, AdminAuth, AdminController.getCategoriesWithProvidersAndGames);
router.get('/dashboard/overview',validate, AdminAuth, AdminController.getAdminDashboardStats);
router.get('/dashboard/social_link',validate, AdminAuth, AdminController.getSocialLinks);
router.post('/dashboard/update_social_link',validate, AdminAuth, AdminController.updateAndCreateSocialLinks);

//////////////////////Sub Admin Routes////////////////////////

router.get('/get_sub_adminList', validate, AdminAuth, AdminController.getSubAdminList);
router.get('/get_sub_admin_user_list', validate, AdminAuth, AdminController.GetSubAdminUserList);
router.get('/get_sub_admin_pending_deposit_user_list', validate, AdminAuth, AdminController.getSubAdminUserDepositList);
router.get('/get_sub_admin_withdraw_deposit_user_list', validate, AdminAuth, AdminController.getSubAdminUserWithdrawList);

// New SubAdmin Transaction Routes (⚠️ These controller functions are missing in AdminController.js)
// router.get('/get_sub_admin_deposits', validate, AdminAuth, AdminController.GetSubAdminDepositTransactions);
// router.get('/get_sub_admin_withdrawals', validate, AdminAuth, AdminController.GetSubAdminWithdrawalTransactions);
// router.post('/create_sub_admin_transaction', validate, AdminAuth, AdminController.CreateSubAdminTransaction);
// router.put('/update_sub_admin_transaction_status', validate, AdminAuth, AdminController.UpdateSubAdminTransactionStatus);

// Admin to SubAdmin Balance Transfer Routes
// 💡 Corrected to use BalanceTransferController instead of AdminController
router.post('/transfer_balance_to_subadmin', validate, AdminAuth, BalanceTransferController.transferBalanceToSubAgent);
router.get('/get_subadmin_balance_transfers', validate, AdminAuth, BalanceTransferController.getSubAgentBalanceTransfers);

// Admin to Agent Balance Transfer Routes
router.post('/admin/transfer_balance_to_agent', validate, AdminAuth, BalanceTransferController.transferBalanceToAgent);
router.get('/admin/get_agent_balance_transfers', validate, AdminAuth, BalanceTransferController.getAgentBalanceTransfers);

// Admin to SubAgent Balance Transfer Routes
router.post('/admin/transfer_balance_to_subagent', validate, AdminAuth, BalanceTransferController.transferBalanceToSubAgent);
router.get('/admin/get_subagent_balance_transfers', validate, AdminAuth, BalanceTransferController.getSubAgentBalanceTransfers);

// Agent to SubAgent Balance Transfer Routes (for Agent Panel)
router.get('/agent/get_affiliated_subagents', validate, AdminAuth, BalanceTransferController.getAffiliatedSubAgents);
router.post('/agent/transfer_balance_to_subagent', validate, AdminAuth, BalanceTransferController.agentTransferToSubAgent);
router.get('/agent/get_subagent_balance_transfers', validate, AdminAuth, BalanceTransferController.getAgentToSubAgentTransfers);

// SubAgent to User Balance Transfer Routes
router.get('/subagent/get_affiliated_users', validate, AdminAuth, BalanceTransferController.getSubAgentAffiliatedUsers);
router.post('/subagent/transfer_balance_to_user', validate, AdminAuth, BalanceTransferController.subAgentTransferToUser);
router.get('/subagent/get_user_balance_transfers', validate, AdminAuth, BalanceTransferController.getSubAgentToUserTransfers);

// Commission Management Routes
router.patch('/admin/agents/:userId/commission', validate, AdminAuth, BalanceTransferController.setAgentCommission);
router.patch('/admin/subagents/:userId/commission', validate, AdminAuth, BalanceTransferController.setSubAgentCommission);
router.get('/admin/agents_with_commission', validate, AdminAuth, BalanceTransferController.getAllAgentsWithCommission);
router.get('/admin/subagents_with_commission', validate, AdminAuth, BalanceTransferController.getAllSubAgentsWithCommission);

// Sub Admin Commission Routes (⚠️ Methods not found in BalanceTransferController)
// router.patch('/commission/sub-admin/:id', AdminAuth('admin'), BalanceTransferController.setSubAdminCommission);
// router.patch('/commission/affiliate/:id', AdminAuth('admin'), BalanceTransferController.setAffiliateCommission);
// router.get('/commission/sub-admins', AdminAuth('admin'), BalanceTransferController.getAllSubAdminsWithCommission);
// router.get('/commission/affiliates', AdminAuth('admin'), BalanceTransferController.getAllAffiliatesWithCommission);

//////////////////////Admin Agent Routes////////////////////////
router.get('/update-admin-balance', validate, AdminAuth, apiIntregationsController.updateAdminBalance);
router.get('/get_admin_agent_list', validate, AdminAuth, AdminController.getAdminAgentList);
router.get('/get_admin_agent_user_list', validate, AdminAuth, AdminController.getAdminAgentUserList);
router.get('/get_admin_agent_user_pending_deposit_user_list', validate, AdminAuth, AdminController.getAdminAgentUserDepositList);
// 💡 Fixed typo in route path (removed double underscore)
router.get('/get_admin_agent_user_withdraw_user_list', validate, AdminAuth, AdminController.getAdminAgentUserWithdrawList);
router.get('/get_user_deposit_withdraw__user', validate, AdminAuth, AdminController.deposit_And_Widthraw_By_Admin);
router.get('/get_user_transaction_report', validate, AdminAuth, AdminController.getTransactionsReport);

//////////////////////Admin Agent Routes////////////////////////
router.get('/get_sub_admin_affiliateList', validate, AdminAuth, AdminController.getAffiliateList);
// router.get('/get_admin_AgentList', validate, AdminAuth, AdminController.GetAgentList);
router.get('/get_admin_UserList', validate, AdminAuth, AdminController.getUserList);
router.get('/get_user_list_by_role', validate, AdminAuth, AdminController.getTransactionList);
router.get('/get_userList', validate, AdminAuth, Usercontrollers.GetRefferralUserList);
// router.get('/dashboard_stats', AdminAuth, AdminController.getDashboardData);

//////////////////////user Routes////////////////////////
router.get('/get_users_by_Id/:userId', validate, AdminAuth, AdminController.GetUserById_detaills);
router.put('/get_users_by_Id_update/:userId', validate, AdminAuth, AdminController.updateUserProfileById);
router.post('/get_users_verify-phone/:userId', validate, AdminAuth, AdminController.verifyUserPhone);
router.post('/get_users_verify-email/:userId', validate, AdminAuth, AdminController.verifyUserEmail);
router.post('/get_users_update-password/:userId', validate, AdminAuth, AdminController.UpdateUserPassword);







router.post(
  '/update-deposit-Widthrowal',
  AdminAuth,
  AdminController.processTransactionForALL
);





router.post(
  '/create_bonus',
  AdminAuth,
  validate,
  [
    body('name').notEmpty().withMessage('Bonus name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('bonusType').notEmpty().withMessage('Bonus type is required'),
    body('img').notEmpty().withMessage('Image URL is required'),
    body('percentage').optional().isNumeric(),
    body('fixedAmount').optional().isNumeric(),
    body('minDeposit').optional().isNumeric(),
    body('maxBonus').optional().isNumeric(),
    body('minTurnover').optional().isNumeric(),
    body('maxTurnover').optional().isNumeric(),
    body('wageringRequirement').optional().isNumeric(),
    body('validDays').optional().isNumeric(),
    body('eligibleGames').optional().isArray(),
    body('isActive').optional().isBoolean(),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601(),
  ],
  AdminController.createBonus
);

// Update an existing bonus
router.put(
  '/update_bonus/:bonusId',
  AdminAuth,
  validate,
  [
    body('name').optional().notEmpty(),
    body('description').optional().notEmpty(),
    body('bonusType').optional().notEmpty(),
    body('img').optional().notEmpty(),
    body('percentage').optional().isNumeric(),
    body('fixedAmount').optional().isNumeric(),
    body('minDeposit').optional().isNumeric(),
    body('maxBonus').optional().isNumeric(),
    body('minTurnover').optional().isNumeric(),
    body('maxTurnover').optional().isNumeric(),
    body('wageringRequirement').optional().isNumeric(),
    body('validDays').optional().isNumeric(),
    body('eligibleGames').optional().isArray(),
    body('isActive').optional().isBoolean(),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601(),
  ],
  AdminController.updateBonus
);

// Delete a bonus
router.delete('/delete_bonus/:bonusId', AdminAuth, AdminController.deleteBonus);


module.exports = router;