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
const BankController = require('../Controllers/BankController');
// const OddBettingController = require('../Controllers/OddBettingController');
const ModelBettingController = require('../Controllers/ModelBettingController');
const TransactionController = require('../Controllers/TransactionController');
const AffiliateController = require('../Controllers/AffiliateController');
const AgentController = require('../Controllers/AgentController');
// const Controllers = require('../Services/CornController');
const Refresh_blance = require('../Controllers/Refresh_blance');
// const messageController = require('../Controllers/messageController');
const CreateSubAdmin = require('../Services/CreateSubAdmin');
const bettingHistoryController = require ("../Controllers/bettingHistoryController")



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
// const Message = require('../Models/Message');
// const SubAdmin = require('../Models/SubAdminModel');

const { createBonus,getAllBonuses } = require('../Controllers/BonusController');
const VipController = require('../Controllers/VipController');






router.get('/odds-sync',AdminController.SyncOdds)




// Admin Route



router.post('/createUser', CreateUserService.register);
router.post('/login_user', CreateUserService.loginUser);
router.post('/user_details', CreateUserService.userDetails);
router.post('/update-name', UpdateProfile.updateName);
router.post('/update-birthday', UpdateProfile.verifyBirthday);
router.get('/verify', CreateUserService.verify);
router.post('/reset_and_update_password', CreateUserService.resetAndUpdatePassword);

router.post('/sendphoneotp', CreateUserService.SendPhoneVerificationCode);
router.post('/sendemailotp', CreateUserService.SendPhoneVerificationCode);
router.post('/verify_opt', CreateUserService.verifyPhone);
router.post('/get_user_social_links', CreateUserService.getUserSocialLinks);
router.post('/get_referred_users', CreateUserService.getReferredUsers);
// router.post('/verify/send', CreateUserService.sendotp);
router.patch('/profile/personal', CreateUserService.updateUser);
// router.get('/verify/otp', UpdateProfile.verifyOTP);
router.get('/verify-email', UpdateProfile.verifyOTP);
// router.get('/user_betting_history', UpdateProfile.sendotp);


router.post('/searchTransactionsbyUserId', TransactionController.searchTransactionsbyUserId)






///////////////////////////////////////SUb Admin    ///////////////////////////////////////////////
router.post('/register_sub_admin',CreateSubAdmin.registerSubAdmin) ;
router.post('/login_sub_admin',CreateSubAdmin.loginSubAdmin) ;
router.get('/verify_sub_admin', CreateSubAdmin.verifySubAdmin);
router.post('/admin_change_password_by_user',CreateSubAdmin.changePasswordUserByAdmin);
router.post('/admin_change_email_by_user',CreateSubAdmin.changeEmailUserByAdmin);

router.post('/admin_verify_phone', CreateSubAdmin.verifyPhoneManually);
router.post('/admin_delate', CreateSubAdmin.SubAdminDelate);
router.post('/admin_verify_email', CreateSubAdmin.verifyEmailManually);
router.post('/sub_admin_User_details', CreateSubAdmin.SubAdminUserDetails);
router.post('/update_and_create_socialLinks', CreateSubAdmin.updateAndcreateSocialLinks);
router.post('/get_socialLinks', CreateSubAdmin.getSocialLinks);
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
router.post('/login_affiliate',AffiliateController.login) ;
router.get('/verify_affiliate', AffiliateController.verify);
router.get('/sub_affiliate', GetAllUser.GetAllUserForSUbAdmin);
///////////////////////////////////////////////////agent   ///////////////////////////////////////////////
router.post('/register_agent',AgentController.registerAgent) ;
router.post('/login_agent',AgentController.loginAgent) ;
router.get('/verify_agent', AgentController.verifyAgent);
router.get('/sub_agent_agent_user', GetAllUser.GetAllUserForSUbAdmin);
///////////////////////////////////////////////////  Sub-agent   ///////////////////////////////////////////////
router.post('/register_Sub_agent',AgentController.registerAgent) ;
router.post('/login_Sub_agent',AgentController.loginAgent) ;
router.get('/verify_Sub_agent', AgentController.verifyAgent);
router.get('/sub_Sub_agent_user', GetAllUser.GetAllUserForSUbAdmin);

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
router.post("/adminregistation", AdminController.CreateAdmin)
router.post("/adminlogin", AdminController.AdminLogin)
// router.get('/verifyAdmin', AdminController.verifySubAdmin);

// Sub Admin  Route
// router.post("/adminregistation", AdminController.CreateAdmin)
// router.post("/adminlogin", AdminController.AdminLogin)
// router.post("/adminlogin", AdminController.AdminLogin)

// Affiliate  Route
// router.post("/adminregistation", AdminController.CreateAdmin)
// router.post("/adminlogin", AdminController.AdminLogin)
// router.post("/adminlogin", AdminController.AdminLogin)
router.post("/bank_add", AdminController.AddBank)









router.get('/get_notifications/:userId',notificationController.getGroupedNotifications);



// 

// router.post('/set-create-promotion',PromotionController.setCreatePromotion) ;

///////////////////////////////////////////////////// Transaction ///////////////////////////////////////////////
// router.post('/add_payment_Method_deposit', TransactionController.AddPaymentMethodNumberDeposit);
// router.post('/add_payment_Method_Widthral', TransactionController.AddPaymentMethodNumberWidthral);
router.post('/subadmingetwaylist', TransactionController.subAdminGetWayList);
router.post('/subadmin_getway_list_Widthraw', TransactionController.subAdminGetWayListWidthraw);
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
router.post('/widthdraw_with_transaction', TransactionController.WithdrawTransaction)
router.post('/deposit_with_approveDeposit_subadmin/:transactionID', TransactionController.approveDepositbySubAdmin)
router.post('/searchDepositTransactions', TransactionController.Search_Deposit_Transactions_Pending)
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
router.post('/user_balance',Refresh_blance.refreshBalance)
router.get('/featured',Refresh_blance.GetFeaturedGames)
router.get('/get_all_providers',Refresh_blance.GetBettingProvider)
router.get('/get_all_category',Refresh_blance.GetBettingCategory)

// router.post('/bettingHistory-member-summary',Refresh_blance.GetBettingHistoryByMember);
// router.get('/bettingHistory/grouped',Refresh_blance.GetBettingHistoryALL);
// router.get('/get-betting-history-detailed',Refresh_blance.getBettingHistoryDetailed);

// router.post("/launch_game", ModelBettingController.launchGame);
router.post("/launch_gamePlayer", Refresh_blance.launchGamePlayer);
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
// router.post('/betting',Controllers.Betting);

// router.post('/odds_event',Controllers.OddEvents);
// router.get('/category_sports',ModelBettingController.Category);
router.put('/update-sports/:id', AdminController.UpdateSportsBettingCategory)
// router.get('/sports',AdminController.GetSports);
router.get('/casino',AdminController.GetCasino);
router.put('/update-bet-provider',AdminController.UpdateBetProvider);
router.put('/update-status-game',AdminController.UpdateStatusGame);
router.put('/updat-status-type',AdminController.UpdateStatusType);
// router.put('/updat-provider-status',AdminController.UpdateStatusProvider);
// router.put('/updat-provider-status',AdminController.UpdateStatusProvider);
router.post('/add-ports',AdminController.AddSports);

router.get('/api/sports',AdminController.GetSportsCategories);

router.get('/GateAllGames',AdminController.GateAllGames);
router.post('/sports_category_add',AdminController.Category_Add);
router.get('/get_sub_category/:cat_id',AdminController.GetSubcategoryById)
// router.get('/odds-sync',AdminController.OddSynrouter)
// router.get('/categories',AdminController.Category)
// router.get('/odds/:key',AdminController.OddByKey)
router.post('/category/add',ModelBettingController.AddCetagory)

// router.post('/bet-price',AdminController.BetPrice);
router.get('/get_casino',AdminController.GetCasinoData);
router.get('/get_active_sports',AdminController.GetActiveSports);
// router.post('/syncCasinoInfo',AdminController.syncCasinoInfo)
router.post('/add-bank',AdminController.AddBank)
router.delete('/delete-bank/:id',AdminController.DeleteBank)

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

router.get('/odds_sports/:key', AdminController.OddSportsByKey);

router.get('/get_casino_cetagory', BettingController.getCasinoCategories);
router.post('/casino-category', BettingController.saveOrUpdateGameCategory);
router.post('/casino/update/:id', BettingController.casino_update);


//bet


 

/////////////////////////////////////////////////////////test api//////////////////////////////////////////////////
// router.get("/get-deeplink",blank2.getDeepLink)
// // router.get("/checkTransaction",blank2.checkTransaction)
// router.get("/fetchBettingHistory",blank3.fetchBettingHistory)
// router.get("/launch-app",blank3.launchApp)
// // router.get("/launch",blank3.generateGameLaunchUrl)

// router.get("/fetchArchivedBettingHistory",blank3.fetchArchivedBettingHistory )
// router.get("/kickPlayer",blank3.kickPlayer )
// router.get('/fetch-betting-history',blank3.BettingHistoryBet)
// router.get('/launch-app',blank3.launchApp)
// router.get('/history', blank3.getHistory);
// router.get('/archived-history', blank3.getArchivedHistory);
// router.post('/mark', blank3.markTickets);
// router.post('/mark-archived', blank3.markArchivedTickets);
// router.post('/daily-report', blank3.getDailyReport);
// router.get('/api/game/log',blank3.logGameSessionone) //app.post('/api/game/log',
// router.get('/api/odds/:key/:id',blank3.getEventOddsById) //  app.post('/api/betting/update',
// router.post('/api/betting/update',blank3.updateBettingEvents) 
// router.post('/launchGameapiorginal',blank3.launchGameapiorginal)
// router.post("/api/gamesADD",blank3.CasinoItemAddNew)
// router.post('/create-member',blank3.createMember)
// router.post("/api/place-bet",blank3.placeBet)
// router.post("/api/deposit",blank3.depositFunds)
// router.post("/api/withdraw",blank3.withdrawFunds)



/////////////////////////////////////////////////////////test api//////////////////////////////////////////////////
// bank
router.post("/update-bank/:id",BankController.UpdateBank)
router.post("/delete-bank",BankController.DeleteBank)











//////////////////////////////////////////////////////////Vip api//////////////////////////////////////////////////



router.post("/vip_info",VipController.getUserVipInfo)
router.post("/convert",VipController.convertVpToMoney)
// router.post("/history",VipController.getConversionHistory)


// Get VP conversion history
// router.get('/history', VipController.getConversionHistory);










//////////////////////////////////////////////////////////massege api//////////////////////////////////////////////////

// router.get('/contacts/:senderId',  async (req, res) => {
//   const userId = req.params;
//   console.log('/contacts/:senderId-----------------4',req.params);
//   try {
//     const contacts = await ChatService.getAllowedContacts(userId.senderId);
//     res.json(contacts);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // Get chat history (HTTP fallback)
// router.get('/history/:senderId/:receiverId',  async (req, res) => {
//   try {
//     console.log('/history/:senderId/:receiverId-----------------5',req.params);
//     const messages = await ChatService.getChatHistory(
//       req.params.senderId,
//       req.params.receiverId
//     );
//     res.json(messages);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });




router.get("/daily-wager", getDailyWager);




module.exports = router