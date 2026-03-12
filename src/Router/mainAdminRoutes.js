// routes/transactionRoutes.js
const express = require('express');
const { body, query } = require('express-validator');
const AdminController = require('../Controllers/AdminController');
const BalanceTransferController = require('../Controllers/BalanceTransferController');
const auth = require('../MiddleWare/AdminAuth');
const validate = require('../MiddleWare/validation');
const Usercontrollers = require('../Controllers/UserController');
const apiIntregationsController = require('../Controllers/apiIntregationsController');
const router = express.Router();

// Search transactions
// ⚠️ Temporarily disabled - pending route fix
// router.get('/New-table-categories-with-Providers', getPlayerUserGameData.getCategoriesWithProviders);
// router.get('/New-Games-with-Providers-By-Category', getPlayerUserGameData.getGamesWithProvidersByCategory);
router.get('/get_admin_affiliateList', validate, auth, AdminController.AffiliateModeladmin);
router.get('/affiliate_get_commissionSettings', validate, auth, AdminController.affiliate_get_commissionSettings);
// router.get('/get_rebate_settings', validate, auth, AdminController.getRebateSettings); // ⚠️ Disabled: Method not found in AdminController
router.get('/get_bonus_list', validate, auth, AdminController.getBonuses);
// router.get('/get_users_by_referral', validate, auth, AdminController.getUsersByReferral);
// router.get('/get_users_by_Id/:userId', validate, auth, AdminController.getUserById_detaills);
router.get('/get_categories_with_providers_and_games', validate, auth, AdminController.getCategoriesWithProvidersAndGames);
router.get('/dashboard/overview',validate, auth, AdminController.getAdminDashboardStats);
router.get('/dashboard/social_link',validate, auth, AdminController.getSocialLinks);
router.post('/dashboard/update_social_link',validate, auth, AdminController.updateAndCreateSocialLinks);

//////////////////////Sub Admin Routes////////////////////////

router.get('/get_sub_adminList', validate, auth, AdminController.getSubAdminList);
router.get('/get_sub_admin_user_list', validate, auth, AdminController.GetSubAdminUserList);
router.get('/get_sub_admin_pending_deposit_user_list', validate, auth, AdminController.getSubAdminUserDepositList);
router.get('/get_sub_admin_withdraw_deposit_user_list', validate, auth, AdminController.getSubAdminUserWithdrawList);

// New SubAdmin Transaction Routes (⚠️ These controller functions are missing in AdminController.js)
// router.get('/get_sub_admin_deposits', validate, auth, AdminController.GetSubAdminDepositTransactions);
// router.get('/get_sub_admin_withdrawals', validate, auth, AdminController.GetSubAdminWithdrawalTransactions);
// router.post('/create_sub_admin_transaction', validate, auth, AdminController.CreateSubAdminTransaction);
// router.put('/update_sub_admin_transaction_status', validate, auth, AdminController.UpdateSubAdminTransactionStatus);

// Admin to SubAdmin Balance Transfer Routes
// 💡 Corrected to use BalanceTransferController instead of AdminController
router.post('/transfer_balance_to_subadmin', validate, auth, BalanceTransferController.transferBalanceToSubAgent);
router.get('/get_subadmin_balance_transfers', validate, auth, BalanceTransferController.getSubAgentBalanceTransfers);

// Admin to Agent Balance Transfer Routes
router.post('/admin/transfer_balance_to_agent', validate, auth, BalanceTransferController.transferBalanceToAgent);
router.get('/admin/get_agent_balance_transfers', validate, auth, BalanceTransferController.getAgentBalanceTransfers);

// Admin to SubAgent Balance Transfer Routes
router.post('/admin/transfer_balance_to_subagent', validate, auth, BalanceTransferController.transferBalanceToSubAgent);
router.get('/admin/get_subagent_balance_transfers', validate, auth, BalanceTransferController.getSubAgentBalanceTransfers);

// Agent to SubAgent Balance Transfer Routes (for Agent Panel)
router.get('/agent/get_affiliated_subagents', validate, auth, BalanceTransferController.getAffiliatedSubAgents);
router.post('/agent/transfer_balance_to_subagent', validate, auth, BalanceTransferController.agentTransferToSubAgent);
router.get('/agent/get_subagent_balance_transfers', validate, auth, BalanceTransferController.getAgentToSubAgentTransfers);

// SubAgent to User Balance Transfer Routes
router.get('/subagent/get_affiliated_users', validate, auth, BalanceTransferController.getSubAgentAffiliatedUsers);
router.post('/subagent/transfer_balance_to_user', validate, auth, BalanceTransferController.subAgentTransferToUser);
router.get('/subagent/get_user_balance_transfers', validate, auth, BalanceTransferController.getSubAgentToUserTransfers);

// Commission Management Routes
router.patch('/admin/agents/:userId/commission', validate, auth, BalanceTransferController.setAgentCommission);
router.patch('/admin/subagents/:userId/commission', validate, auth, BalanceTransferController.setSubAgentCommission);
router.get('/admin/agents_with_commission', validate, auth, BalanceTransferController.getAllAgentsWithCommission);
router.get('/admin/subagents_with_commission', validate, auth, BalanceTransferController.getAllSubAgentsWithCommission);

// Sub Admin Commission Routes (⚠️ Methods not found in BalanceTransferController)
// router.patch('/commission/sub-admin/:id', auth('admin'), BalanceTransferController.setSubAdminCommission);
// router.patch('/commission/affiliate/:id', auth('admin'), BalanceTransferController.setAffiliateCommission);
// router.get('/commission/sub-admins', auth('admin'), BalanceTransferController.getAllSubAdminsWithCommission);
// router.get('/commission/affiliates', auth('admin'), BalanceTransferController.getAllAffiliatesWithCommission);

//////////////////////Admin Agent Routes////////////////////////
router.get('/update-admin-balance', validate, auth, apiIntregationsController.updateAdminBalance);
router.get('/get_admin_agent_list', validate, auth, AdminController.getAdminAgentList);
router.get('/get_admin_agent_user_list', validate, auth, AdminController.getAdminAgentUserList);
router.get('/get_admin_agent_user_pending_deposit_user_list', validate, auth, AdminController.getAdminAgentUserDepositList);
// 💡 Fixed typo in route path (removed double underscore)
router.get('/get_admin_agent_user_withdraw_user_list', validate, auth, AdminController.getAdminAgentUserWithdrawList);
router.get('/get_user_deposit_withdraw__user', validate, auth, AdminController.deposit_And_Widthraw_By_Admin);
router.get('/get_user_transaction_report', validate, auth, AdminController.getTransactionsReport);

//////////////////////Admin Agent Routes////////////////////////
router.get('/get_sub_admin_affiliateList', validate, auth, AdminController.getAffiliateList);
// router.get('/get_admin_AgentList', validate, auth, AdminController.GetAgentList);
router.get('/get_admin_UserList', validate, auth, AdminController.getUserList);
router.get('/get_user_list_by_role', validate, auth, AdminController.getTransactionList);
router.get('/get_userList', validate, auth, Usercontrollers.GetRefferralUserList);
// router.get('/dashboard_stats', auth, AdminController.getDashboardData);

//////////////////////user Routes////////////////////////
router.get('/get_users_by_Id/:userId', validate, auth, AdminController.GetUserById_detaills);
router.put('/get_users_by_Id_update/:userId', validate, auth, AdminController.updateUserProfileById);
router.post('/get_users_verify-phone/:userId', validate, auth, AdminController.verifyUserPhone);
router.post('/get_users_verify-email/:userId', validate, auth, AdminController.verifyUserEmail);
router.post('/get_users_update-password/:userId', validate, auth, AdminController.UpdateUserPassword);







router.post(
  '/update-deposit-Widthrowal',
  auth,
  AdminController.processTransactionForALL
);





router.post(
  '/create_bonus',
  auth,
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
  auth,
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
router.delete('/delete_bonus/:bonusId', auth, AdminController.deleteBonus);


module.exports = router;