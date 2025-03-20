const express = require('express')
const router = express.Router()
const AdminController = require("../Controllers/AdminController")
const CreateUserService = require("../Services/CreateUserService");
const UpdateProfile = require('../Controllers/UpdateProfile');
const { authMiddleware } = require('../MiddleWare/AuthVerifyMiddleWare');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const BettingController = require('../Controllers/BettingController');
const BankController = require('../Controllers/BankController');
const OddBettingController = require('../Controllers/OddBettingController');
const ModelBettingController = require('../Controllers/ModelBettingController');
const TransactionController = require('../Controllers/TransactionController');
const AffiliateController = require('../Controllers/AffiliateController');
const AgentController = require('../Controllers/AgentController');
const Controllers = require('../Controllers/CornController');
const Refresh_blance = require('../Controllers/Refresh_blance');
const messageController = require('../Controllers/messageController');
const CreateSubAdmin = require('../Services/CreateSubAdmin');
const socketIo = require('socket.io');


// const Promotion = require('../Models/PromotionSchema');
const PromotionController = require('../Controllers/PromotionController');
const AuthVerifyMiddleWare = require('../MiddleWare/AuthVerifyMiddleWare');
const GetAllUser= require('../Services/GetAllUser');
const { Transaction } = require('mongodb');
const { getDailyWager } = require('../Controllers/MyController');
const blank= require('../Controllers/blank');
const blank2= require('../Controllers/blank2');
const blank3= require('../Controllers/blank3');





router.get('/odds-sync',AdminController.SyncOdds)




// Admin Route



router.post('/createUser', CreateUserService.register);
router.post('/login_user', CreateUserService.loginUser);
router.post('/user_details', CreateUserService.userDetails);
router.post('/update-name', UpdateProfile.updateName);
router.post('/update-birthday', UpdateProfile.verifyBirthday);
router.get('/verify', CreateUserService.verify);
router.get('/send-otp', UpdateProfile.VerifyOpt);
router.get('/verify-email', UpdateProfile.SandOpt);
router.get('/user_betting_history', UpdateProfile.SandOpt);


router.post('/searchTransactionsbyUserId', TransactionController.searchTransactionsbyUserId)






///////////////////////////////////////SUb Admin    ///////////////////////////////////////////////
router.post('/register_sub_admin',CreateSubAdmin.registerSubAdmin) ;
router.post('/login_sub_admin',CreateSubAdmin.loginSubAdmin) ;
router.get('/verify_sub_admin', CreateSubAdmin.verifySubAdmin);
router.get('/sub_admin_User', GetAllUser.GetAllUserForSUbAdmin);
router.post('/sub_admin_User_details', CreateSubAdmin.SubAdminUserDetails);
router.post('/sub_admin_tnx_deposit_details_summary', TransactionController.getTransactionDepositTotals);
router.post('/sub_admin_tnx_widthraw_details_summary', TransactionController.getTransactionWidthrawTotals);
router.post('/sub_admin_deposit_total', TransactionController.totalDeposit);
router.post('/sub_admin_widthraw_total', TransactionController.totalWidthraw);
router.post('/sub_admin_chats_deposit_Summary', TransactionController.chatsSummary);
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



// 

// router.post('/set-create-promotion',PromotionController.setCreatePromotion) ;

///////////////////////////////////////////////////// Transaction ///////////////////////////////////////////////
router.post('/addpaymentMethodNumber', TransactionController.AddPaymentMethodNumber);
router.post('/subadmingetwaylist', TransactionController.subAdminGetWayList);
router.post('/subadmingetwaylist', TransactionController.subAdminGetWayList);
router.post('/subadmingetwaylistfor_user', TransactionController.GetPaymentMethodsUser);

// router.get("/api/v1/submitTransaction", (req,res)=>console.log(req));
router.post("/submitTransaction", TransactionController.submitTransaction);
router.post('/deposits_list', TransactionController.DepositsList);
// router.post('/deposits_list', TransactionController.DepositsList);

// router.get('/admin_deposits_list', TransactionController.AdminDepositsList);
router.post('/deposit_with_bonus', TransactionController.addTransaction)
router.post('/widthdraw_with_transaction', TransactionController.WithdrawTransaction)
router.post('/deposit_with_approveDeposit_subadmin/:transactionID', TransactionController.approveDepositbySubAdmin)
router.post('/searchDepositTransactions', TransactionController.searchDepositTransactions)
router.post('/searchDepositTransactionsReportAprove', TransactionController.searchDepositTransactionsReportAprove)
router.post('/searchDepositTransactionsReportreject', TransactionController.searchDepositTransactionsReportreject)


router.post('/widthraw_with_approvewidthraw_subadmin/:transactionID', TransactionController.approveWidthdrawBySubAdmin)
router.post('/searchWidthdrawTransactions', TransactionController.searchWidthdrawTransactions)
router.post('/approveTransfarWithDepositbySubAdmin', TransactionController.approveTransfarWithDepositbySubAdmin)
router.post('/searchWidthdrawTransactionsReportAprove', TransactionController.searchWidthdrawTransactionsReportAprove)
router.post('/searchWidthdrawTransactionsReportReject', TransactionController.searchWidthdrawTransactionsReportReject)

router.post('/Widthdraw_ListBy_user', TransactionController.WidthdrawListByUser)
router.post('/get_all_user_For_Sub_Admin', TransactionController.GetAllUser_For_Sub_Admin)
router.post('/getUser_Transaction_History', TransactionController.getUserTransactionHistory);









///////////////////////////////////////////////////// Transaction ///////////////////////////////////////////////


//game font
// router.post("/assign-category",FrontCetegoryController.assignCategory)
// router.get("/categories",FrontCetegoryController.GetFontCategories) 
// router.get("/games", FrontCetegoryController.GetFontGames)

// Admin Game Page

// router.get("/sports-list",ModelBettingController.Sports_list);
// router.post('/add-sports',AdminController.AddSportsBetting);
router.get('/search',ModelBettingController.searchGames)
router.post('/casino_item_add', ModelBettingController.CasinoItemAdd)
// router.post('/casino_item_add_new', blank2.CasinoItemAddNEWs )
router.post('/create-category', ModelBettingController.CreateCategory)
router.post('/casino_item_update', ModelBettingController.CasinoItemSingleUpdate)
router.get('/get-all-category', ModelBettingController.GetAllCategory)
router.get('/games/:id', ModelBettingController.ShowGameListById)
router.get('/get_all_provider', ModelBettingController.GetAllProvider)
router.post('/user_balance',Refresh_blance.refreshBalance)
router.get('/user-history',ModelBettingController.UserHistory)
router.post("/launch_game", ModelBettingController.launchGame);
router.post("/launch_gamePlayer", Refresh_blance.launchGamePlayer);
router.post("/game-update-serial", ModelBettingController.updateSerialNumber);
router.post("/game-update-category", ModelBettingController.updateCategoryGameByID);
router.get("/New-table-categories", ModelBettingController.getCategoriesWithGamesAndProviders);
router.get("/New-table-Games-with-Providers", ModelBettingController.getCategoriesWithProviders);
router.get("/New-Games-with-Providers-By-Category", ModelBettingController.getCategoriesWithProvidersGameList);


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
router.post('/betting',Controllers.Betting);

router.post('/odds_event',Controllers.OddEvents);
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
// router.post('/modal_data',ModelBettingController.Modal);
// router.get('/sync-casino-info',AdminController.syncCasinoInfo);
// router.post('/update-game-type',AdminController.UpdateGameType);
// router.post('/delete-game-type/:id',AdminController.DeleteGameType);
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
router.get('/userbet/:id', BettingController.getUserBet);
router.get('/user_bet/:id', Controllers.userbet);
router.get('/bet_History/:id', Controllers.bet_history);

// Get bet history
router.get('/bethistory/:id', BettingController.getBetHistory);

// Update bet status
router.put('/update-bet', BettingController.updateBet);
router.put('/add_sports', ModelBettingController.Add_Sports);
router.put('/betting_update', BettingController.BettingUpdate);
router.put('/betting_update', BettingController.BettingUpdate);
router.post('/apply', Controllers.Apply);
router.post('/delete-betting/:id', Controllers.DeleteBettingType);
// router.get('/betting', BettingController.Betting);
// router.post('/update_json/:id', BettingController.JsonUpdate);
router.post('/bet_sync', Controllers.betSync);
router.get('/odds_sports/:key', AdminController.OddSportsByKey);
// router.post('/odds_event', BettingController.OddEvents);
// router.get('/odds-scores/:key', BettingController.OddSportsBykey);
// router.get('/odds/active/:key', BettingController.OddsEventByKey);
// router.get('/odds_betting/:id', oddsBetting);
router.get('/odds-historical', Controllers.OddHistory);
// router.post('/edit', BettingController.EditBettingType);
// router.delete('/deleteBetting/:type',  BettingController.OddHistory);
router.get('/get_casino_cetagory', BettingController.getCasinoCategories);
router.post('/casino-category', BettingController.saveOrUpdateGameCategory);
router.post('/casino/update/:id', BettingController.casino_update);


//bet

 router.get('/odds-sports/:key', ModelBettingController.getOddsSports);
 router.get('/OddSync', ModelBettingController.OddSync);
router.post('/update-json', OddBettingController.updateJson);
/////////////////////////////////////////////////////////test api//////////////////////////////////////////////////
// router.get("/get-deeplink",blank2.getDeepLink)
// // router.get("/checkTransaction",blank2.checkTransaction)
// router.get("/fetchBettingHistory",blank3.fetchBettingHistory)
// router.get("/launch-app",blank3.launchApp)
// // router.get("/launch",blank3.generateGameLaunchUrl)

// router.get("/fetchArchivedBettingHistory",blank3.fetchArchivedBettingHistory )
// router.get("/kickPlayer",blank3.kickPlayer )
// router.get("/api/games",blank3.getGames)
// router.get('/api/game/log',blank3.logGameSessionone) //app.post('/api/game/log',
// router.get('/api/odds/:key/:id',blank3.getEventOddsById) //  app.post('/api/betting/update',
// router.post('/api/betting/update',blank3.updateBettingEvents) 
// router.get('/corn',blank3.BettingUpdate)
// router.post("/api/gamesADD",blank3.CasinoItemAddNew)
// router.post('/create-member',blank3.createMember)
// router.post("/api/place-bet",blank3.placeBet)
// router.post("/api/deposit",blank3.depositFunds)
// router.post("/api/withdraw",blank3.withdrawFunds)
/////////////////////////////////////////////////////////test api//////////////////////////////////////////////////
// bank
router.post("/update-bank/:id",BankController.UpdateBank)
router.post("/delete-bank",BankController.DeleteBank)






router.get("/daily-wager", getDailyWager);




module.exports = router