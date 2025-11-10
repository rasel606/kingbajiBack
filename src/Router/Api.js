const express = require('express')
const router = express.Router()
const AdminController = require("../Controllers/AdminController")
const CreateUserService = require("../Services/CreateUserService");
const UpdateProfile = require('../Controllers/UpdateProfile');
// const  authMiddleware  = require('../MiddleWare/AuthVerifyMiddleWare');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
const BettingController = require('../Controllers/BettingController');
// const BankController = require('../Controllers/BankController.js');
// const OddBettingController = require('../Controllers/OddBettingController');
const ModelBettingController = require('../Controllers/ModelBettingController');
const TransactionController = require('../Controllers/TransactionController');
const AffiliateController = require('../Controllers/AffiliateController');
const AffiliateDashboardController = require('../Controllers/AffiliateDashboardController');
const AffiliateMemberController = require('../Controllers/AffiliateMemberController');

const AgentController = require('../Controllers/AgentController');
// const Controllers = require('../Services/CornController');
const Refresh_blance = require('../Controllers/Refresh_blance');
// const messageController = require('../Controllers/messageController');
// const CreateSubAdmin = require('../Services/CreateSubAdmin');
const bettingHistoryController = require ("../Controllers/bettingHistoryController")
// const vipBonusesController = require('../Controllers/vipBonusesController');


// const Promotion = require('../Models/PromotionSchema');
// const PromotionController = require('../Controllers/PromotionController');
// const AuthVerifyMiddleWare = require('../MiddleWare/AuthVerifyMiddleWare');
const GetAllUser= require('../Services/GetAllUser');
// const { Transaction } = require('mongodb');
const { getDailyWager } = require('../Controllers/MyController');
const blank= require('../Controllers/blank');
// const blank2= require('../Controllers/blank2');
// const blank3= require('../Controllers/blank3');
// const chatController= require('../Controllers/ChatController');
const notificationController = require('../Controllers/notificationController');
const BankController = require('../Controllers/BankController');
// const Message = require('../Models/Message');
// const SubAdmin = require('../Models/SubAdminModel');
const {auth} = require('../MiddleWare/auth');
const { createBonus,getAllBonuses } = require('../Controllers/BonusTransactionController');
const {register, loginUser} = require('../Controllers/AuthController');

// const BonusTransactionController = require('../Controllers/vipBonusesController');
const { Console } = require('winston/lib/winston/transports');





router.post('/createUser', register);
router.post('/login_user', loginUser);
// router.post('/login_user', CreateUserService.loginUser);
// router.post('/login_user',(req,res)=>{
//   const { userId, password } = req.body;
//  console.log("login_user",req.body);

//   CreateUserService.loginUser(req, res);
// })
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





// VIP Status
// router.get('/status/:userId', vipBonusesController.getVipStatus);
// router.post('/convert',  vipBonusesController.convertPoints);

// // Admin endpoints
// router.post('/adjust',  vipBonusesController.adjustPoints);
// router.post('/update-level',  vipBonusesController.updateLevel);
// router.post('/run-daily',  vipBonusesController.runDailyCalculation);
// router.post('/run-monthly',  vipBonusesController.runMonthlyProcessing);


///////////////////////////////////////SUb Admin    ///////////////////////////////////////////////
// router.post('/register_sub_admin',CreateSubAdmin.registerSubAdmin) ;
// router.post('/login_sub_admin',CreateSubAdmin.loginSubAdmin) ;
// router.get('/verify_sub_admin', CreateSubAdmin.verifySubAdmin);
// router.post('/admin_change_password_by_user',CreateSubAdmin.changePasswordUserByAdmin);
// router.post('/admin_change_email_by_user',CreateSubAdmin.changeEmailUserByAdmin);

// router.post('/admin_verify_phone', CreateSubAdmin.verifyPhoneManually);
// router.post('/admin_delate', CreateSubAdmin.SubAdminDelate);
// router.post('/admin_verify_email', CreateSubAdmin.verifyEmailManually);
// router.post('/sub_admin_User_details', CreateSubAdmin.SubAdminUserDetails);
// router.post('/update_and_create_socialLinks', CreateSubAdmin.updateAndcreateSocialLinks);
// router.post('/get_socialLinks', CreateSubAdmin.getSocialLinks);
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
// router.post('/subadmin_forgot-password', CreateSubAdmin.forgotPassword);
// router.post('/subadmin/reset-password', CreateSubAdmin.resetPassword);
// router.post('/subadmin/update-password', CreateSubAdmin.updatePassword);
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
// router.get('/affiliate/dashboard', AffiliateDashboardController.getAffiliateDashboard);
///////////////////////////////////////////////////agent   ///////////////////////////////////////////////
// router.post('/register_agent',AgentController.registerAgent) ;
// router.post('/login_agent',AgentController.loginAgent) ;
// router.get('/verify_agent', AgentController.verifyAgent);
// router.get('/sub_agent_agent_user', GetAllUser.GetAllUserForSUbAdmin);
///////////////////////////////////////////////////  Sub-agent   ///////////////////////////////////////////////
// router.post('/register_Sub_agent',AgentController.registerAgent) ;
// router.post('/login_Sub_agent',AgentController.loginAgent) ;
// router.get('/verify_Sub_agent', AgentController.verifyAgent);
// router.get('/sub_Sub_agent_user', GetAllUser.GetAllUserForSUbAdmin);

///////////////////////////////////////////////////  Deposit   ///////////////////////////////////////////////



// router.get('/withdrawals_list', TransactionController.WithdrawalsList);
// router.get('/withdraw_with_turenover', TransactionController.withdrawWIthTurenover);
// router.get('/deposit_with_bonus', TransactionController.depositWIthBonus);
// router.get('/admin_withdraw_action', TransactionController.adminWithdrawAction);

// router.post('/validate', validateUserDetails);
// router.post('/send-otp', CreateUserService.sendOtp);
// router.post('/verify-otp', verifyOtp);
// router.post('./routes/transactionRoutes');
// Admin Route
// router.post("/adminregistation", AdminController.CreateAdmin)
// router.post("/adminlogin", AdminController.AdminLogin)
// router.get('/verifyAdmin', AdminController.verifySubAdmin);

// Sub Admin  Route
// router.post("/adminregistation", AdminController.CreateAdmin)
// router.post("/adminlogin", AdminController.AdminLogin)
// router.post("/adminlogin", AdminController.AdminLogin)

// Affiliate  Route
// router.post("/adminregistation", AdminController.CreateAdmin)
// router.post("/adminlogin", AdminController.AdminLogin)
// router.post("/adminlogin", AdminController.AdminLogin)
router.get("/bank", BankController.getBanks)









router.get('/get_notifications/:userId',notificationController.getGroupedNotifications);



// 

// router.post('/set-create-promotion',PromotionController.setCreatePromotion) ;

///////////////////////////////////////////////////// Transaction ///////////////////////////////////////////////
// router.post('/add_payment_Method_deposit', TransactionController.AddPaymentMethodNumberDeposit);
// router.post('/add_payment_Method_Widthral', TransactionController.AddPaymentMethodNumberWidthral);
// router.post('/getway_list_dposit', TransactionController.DepositGetWayList);
// router.post('/getway_list_Widthraw', TransactionController.WidthrawGetWayList);
router.post('/subadmingetwaylistfor_user', TransactionController.GetPaymentMethodsUser);
router.post('/subadmin_getway_widthraw_listfor_user', TransactionController.GetPaymentMethodsWidthrawUser);
router.post('/update_deposit_gateway_status', TransactionController.updateDepositGatewayStatus);
router.post('/update_deposit_gateway_type', TransactionController.updatedepositGatewayType);
router.post('/update_widthraw_gateway_status', TransactionController.updateWidthrawGatewayStatus);
router.post('/update_withdrawal_gateway_type', TransactionController.updateWithdrawalGatewayType);


// router.get("/api/v1/submitTransaction", (req,res)=>console.log(req));
router.post("/submitTransaction", TransactionController.submitTransaction);
router.post('/deposits_list', TransactionController.DepositsList);
// router.post('/deposits_list', TransactionController.DepositsList);

// router.get('/admin_deposits_list', TransactionController.AdminDepositsList);
router.post('/deposit_with_bonus', TransactionController.addTransaction)
// router.post('/widthdraw_with_transaction', TransactionController.WithdrawTransaction)
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



///////////////////////////////////////////////////// Chat ///////////////////////////////////////////////

// router.get("/:userId", chatController.getChatHistory);
// router.get("/referral-chat/:user1Id/:user2Id", chatController.getReferralChat);
// router.get("/chat-list", chatController.getChatList);



///////////////////////////////////////////////////// Transaction ///////////////////////////////////////////////


//game font

// router.get('/search',ModelBettingController.searchGames)
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

// router.post('/bettingHistory-member-summary',Refresh_blance.GetBettingHistoryByMember);
// router.get('/bettingHistory/grouped',Refresh_blance.GetBettingHistoryALL);
// router.get('/get-betting-history-detailed',Refresh_blance.getBettingHistoryDetailed);

// router.post("/launch_game", ModelBettingController.launchGame);
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
// router.post("/legal",blank.tnx)
// router.post("/bnct",blnc)

///////////////////////////////////chat //////////////////////////////////////////
// router.post('/api/chat', chat);
// router.get('/api/message', authenticate, messageRoutes);
// router.post('/send-message', messageController.sendMessage);
// router.get('/messages/:receiver', messageController.getMessages);

/////////////////////////////////////////////////////////////////////////////
// router.post('/send', sendNotification);
// router.get('/', getNotifications);

/////////////////////////////////////////////////////////////////////////////////////////////



/////////////////////////////////////////////////////////////////////////////////////////////

router.put('/update-bet-provider',AdminController.UpdateBetProvider);
router.put('/update-status-game',AdminController.UpdateStatusGame);
// router.put('/updat-status-type',AdminController.UpdateStatusType);
// router.put('/updat-provider-status',AdminController.UpdateStatusProvider);
// router.put('/updat-provider-status',AdminController.UpdateStatusProvider);
// router.post('/add-ports',AdminController.AddSports);



router.get('/GateAllGames',AdminController.GateAllGames);

// router.get('/odds-sync',AdminController.OddSynrouter)
// router.get('/categories',AdminController.Category)
// router.get('/odds/:key',AdminController.OddByKey)
router.post('/category/add',ModelBettingController.AddCetagory)



//bet

// Get user bet and related bets
// router.get('/userbet/:id', BettingController.getUserBet);
// router.get('/user_bet/:id', Controllers.userbet);
// router.get('/bet_History/:id', Controllers.bet_history);

// Get bet history
router.get('/bethistory/:id', BettingController.getBetHistory);

// Update bet status
router.put('/update-bet', BettingController.updateBet);

router.put('/betting_update', BettingController.BettingUpdate);

// router.get('/odds_sports/:key', AdminController.OddSportsByKey);

// router.get('/get_casino_cetagory', BettingController.getCasinoCategories);
// router.post('/casino-category', BettingController.saveOrUpdateGameCategory);
// router.post('/casino/update/:id', BettingController.casino_update);


//bet


 




router.get("/daily-wager", getDailyWager);




module.exports = router;