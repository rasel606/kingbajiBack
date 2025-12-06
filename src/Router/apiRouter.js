const express = require('express')
const router = express.Router()
const AdminController = require("../Controllers/AdminController")
const CreateUserService = require("../services/CreateUserService");
const UpdateProfile = require('../Controllers/UpdateProfile');

const BettingController = require('../Controllers/BettingController');

const ModelBettingController = require('../Controllers/ModelBettingController');
const TransactionController = require('../Controllers/TransactionController');
const AffiliateController = require('../Controllers/AffiliateController');
const AffiliateDashboardController = require('../Controllers/AffiliateDashboardController');
const AffiliateMemberController = require('../Controllers/AffiliateMemberController');

const AgentController = require('../Controllers/AgentController');

const Refresh_blance = require('../Controllers/Refresh_blance');

const bettingHistoryController = require ("../Controllers/bettingHistoryController")

const GetAllUser= require('../services/GetAllUser');
// const { Transaction } = require('mongodb');
const { getDailyWager } = require('../Controllers/MyController');
const blank= require('../Controllers/blank');

const notificationController = require('../Controllers/notificationController');
const BankController = require('../Controllers/BankController');

const {auth} = require('../MiddleWare/auth');
const { createBonus,getAllBonuses } = require('../Controllers/BonusTransactionController');
const {register, loginUser} = require('../Controllers/AuthController');

// const BonusTransactionController = require('../Controllers/vipBonusesController');
const { Console } = require('winston/lib/winston/transports');





router.post('/createUser', register);
router.post('/login_user', loginUser);

router.get('/user_details', auth, CreateUserService.userDetails);
router.post('/update-name', UpdateProfile.updateName);
router.post('/update-birthday', UpdateProfile.verifyBirthday);
router.get('/verify', CreateUserService.verify);
router.post('/reset_and_update_password', CreateUserService.resetAndUpdatePassword);

router.post('/sendphoneotp', CreateUserService.SendPhoneVerificationCode);
router.post('/sendemailotp', CreateUserService.SendPhoneVerificationCode);
router.post('/verify_opt', CreateUserService.verifyPhone);
// router.post('/get_user_social_links', CreateUserService.getUserSocialLinks);
router.post('/get_referred_users', CreateUserService.getReferredUsers);
// router.post('/verify/send', CreateUserService.sendotp);
router.patch('/profile/personal', CreateUserService.updateUser);
// router.get('/verify/otp', UpdateProfile.verifyOTP);
router.get('/verify-email', UpdateProfile.verifyOTP);
// router.get('/user_betting_history', UpdateProfile.sendotp);


router.post('/searchTransactionsbyUserId', TransactionController.searchTransactionsbyUserId)





router.get('/sub_admin_User', GetAllUser.GetAllUserForSUbAdmin);
router.post('/sub_admin_tnx_deposit_details_summary', TransactionController.getTransactionDepositTotals);
router.post('/sub_admin_tnx_widthraw_details_summary', TransactionController.getTransactionWidthrawTotals);
router.post('/sub_admin_deposit_total', TransactionController.totalDeposit);
router.post('/sub_admin_widthraw_total', TransactionController.totalWidthraw);
router.post('/sub_admin_chats_deposit_Summary', TransactionController.chatsSummary);
router.post('/checkWithdrawalEligibility', TransactionController.checkWithdrawalEligibility);
router.post('/checkWithdrawalEligibility/active', TransactionController.checkWithdrawalEligibilityActive);
router.post('/checkWithdrawalEligibility/complate', TransactionController.checkWithdrawalEligibilityComplated);

router.post('/create_bonuses',createBonus);
router.post('/bonuses',getAllBonuses);

///////////////////////////////////////affiliate    ///////////////////////////////////////////////
router.post('/register_affiliate',AffiliateController.registerAffiliate) ;
router.post('/login_affiliate',AffiliateController.Affiliate_login) ;
// router.get('/verify_affiliate', AffiliateController.verify_affiliate);
// router.get('/captcha', AffiliateController.generateCaptcha); 
router.get('/logout', AffiliateController.logout); 
router.get('/get_dashboard_data', AffiliateController.protect,AffiliateDashboardController.getAffiliateDashboard); 
router.get('/search_members', AffiliateController.protect,AffiliateMemberController.searchMembers); 
router.get('/export_members', AffiliateController.protect,AffiliateMemberController.exportMembers); 
router.post('/affilate_profile',  AffiliateController.getProfile);
router.get('/sub_affiliate', GetAllUser.GetAllUserForSUbAdmin);


router.get('/check', AffiliateController.protect, (req, res) => {
// console.log(req.user) 
  res.status(200).json({ user: req.user });
});

router.get("/bank", BankController.getBanks)

router.get('/get_notifications/:userId',notificationController.getGroupedNotifications);




router.post('/subadmingetwaylistfor_user', TransactionController.GetPaymentMethodsUser);
router.post('/subadmin_getway_widthraw_listfor_user', TransactionController.GetPaymentMethodsWidthrawUser);
router.post('/update_deposit_gateway_status', TransactionController.updateDepositGatewayStatus);
router.post('/update_deposit_gateway_type', TransactionController.updatedepositGatewayType);
router.post('/update_widthraw_gateway_status', TransactionController.updateWidthrawGatewayStatus);
router.post('/update_withdrawal_gateway_type', TransactionController.updateWithdrawalGatewayType);


router.post("/submitTransaction", TransactionController.submitTransaction);
router.post('/deposits_list', TransactionController.DepositsList);

router.post('/deposit_with_bonus', TransactionController.addTransaction)

router.post('/deposit_with_approveDeposit_subadmin/:transactionID', TransactionController.approveDepositbySubAdmin)
router.post('/search_Deposit_transactions_pendings', TransactionController.Search_Deposit_Transactions_Pending)
router.post('/searchDepositTransactionsReportAprove', TransactionController.searchDepositTransactionsReportAprove)
router.post('/searchDepositTransactionsReportreject', TransactionController.searchDepositTransactionsReportreject)


router.post('/widthraw_with_approvewidthraw_subadmin/:transactionID', TransactionController.approveWidthdrawBySubAdmin)
router.post('/searchWidthdrawTransactions', TransactionController.searchWidthdrawTransactions)
router.post('/approveTransfarWithDepositbySubAdmin', TransactionController.Approve_Transfar_With_Deposit_And_Widthraw_By_SubAdmin)
router.post('/searchWidthdrawTransactionsReportAprove', TransactionController.searchWidthdrawTransactionsReportAprove)
router.post('/searchWidthdrawTransactionsReportReject', TransactionController.searchWidthdrawTransactionsReportReject)

router.post('/Widthdraw_ListBy_user', TransactionController.WidthdrawListByUser)
router.post('/get_all_user_For_Sub_Admin', TransactionController.GetAllUser_For_Sub_Admin)
router.post('/getUser_Transaction_History', TransactionController.getUserTransactionHistory);




router.post('/casino_item_add', ModelBettingController.CasinoItemAdd)

router.post('/create-category', ModelBettingController.CreateCategory)
router.post('/casino_item_update', ModelBettingController.CasinoItemSingleUpdate)
router.get('/get-all-category', ModelBettingController.GetAllCategory)
router.get('/games/:id', ModelBettingController.ShowGameListById)
router.get('/get_all_provider', ModelBettingController.GetAllProvider)
router.post('/DeleteGameListByGtype', ModelBettingController.DeleteGameListByGtype)
router.get('/user_balance',auth, Refresh_blance.refreshBalance)
router.get('/featured',Refresh_blance.GetFeaturedGames)
router.get('/get_all_providers',Refresh_blance.GetBettingProvider)
router.get('/get_all_category',Refresh_blance.GetBettingCategory)

router.get("/launch_gamePlayer/:game_id/:p_code",auth, Refresh_blance.launchGamePlayer);
router.post("/game-update-serial", ModelBettingController.updateSerialNumber);
router.post("/game-update-category", ModelBettingController.updateCategoryGameByID);
router.get("/New-table-categories", ModelBettingController.getCategoriesWithGamesAndProviders);
router.get("/New-table-Games-with-Providers", ModelBettingController.getCategoriesWithProviders);
router.get("/New-Games-with-Providers-By-Category", ModelBettingController.getCategoriesWithProvidersGameList);
router.get('/search', ModelBettingController.searchGamesByName);
router.post('/categories', ModelBettingController.moveGamesToAnotherCategory);
router.get('/betting-records/detail',bettingHistoryController.BettingRecordDetails)
router.get('/betting-records/summary',bettingHistoryController.BettingRecordSummary)


router.put('/update-bet-provider',AdminController.UpdateBetProvider);
router.put('/update-status-game',AdminController.UpdateStatusGame);
router.get('/get-all-games', ModelBettingController.GetAllGameList);
router.get('/get-all-games-by-category', ModelBettingController.GetAllGameListByCategory);



router.get('/GateAllGames',AdminController.GateAllGames);

router.post('/category/add',ModelBettingController.AddCetagory)



router.get('/bethistory/:id', BettingController.getBetHistory);

// Update bet status
router.put('/update-bet', BettingController.updateBet);

router.put('/betting_update', BettingController.BettingUpdate);



 




router.get("/daily-wager", getDailyWager);




module.exports = router;