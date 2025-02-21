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
const CreateSubAdmin = require('../Services/CreateSubAdmin');



// const Promotion = require('../Models/PromotionSchema');
const PromotionController = require('../Controllers/PromotionController');
const AuthVerifyMiddleWare = require('../MiddleWare/AuthVerifyMiddleWare');
const GetAllUser= require('../Services/GetAllUser');
const { Transaction } = require('mongodb');
const { getDailyWager } = require('../Controllers/MyController');
const blank= require('../Controllers/blank');



router.get('/odds-sync',AdminController.SyncOdds)




// Admin Route



router.post('/createUser', CreateUserService.register);
router.post('/login_user', CreateUserService.loginUser);
router.post('/update-name', UpdateProfile.updateName);
router.post('/update-birthday', UpdateProfile.verifyBirthday);
router.get('/verify', CreateUserService.verify);
router.get('/send-otp', UpdateProfile.VerifyOpt);
router.get('/verify-email', UpdateProfile.SandOpt);









///////////////////////////////////////SUb Admin    ///////////////////////////////////////////////
router.post('/register_sub_admin',CreateSubAdmin.registerSubAdmin) ;
router.post('/login_sub_admin',CreateSubAdmin.loginSubAdmin) ;
router.get('/verify_sub_admin', CreateSubAdmin.verifySubAdmin);
router.get('/sub_admin_User', GetAllUser.GetAllUserForSUbAdmin);
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


router.get('/deposits_list', TransactionController.DepositsList);
router.get('/withdrawals_list', TransactionController.WithdrawalsList);
router.get('/withdraw_with_turenover', TransactionController.withdrawWIthTurenover);
router.get('/deposit_with_bonus', TransactionController.depositWIthBonus);
router.get('/admin_withdraw_action', TransactionController.adminWithdrawAction);

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




//game font
// router.post("/assign-category",FrontCetegoryController.assignCategory)
// router.get("/categories",FrontCetegoryController.GetFontCategories) 
// router.get("/games", FrontCetegoryController.GetFontGames)

// Admin Game Page

// router.get("/sports-list",ModelBettingController.Sports_list);
// router.post('/add-sports',AdminController.AddSportsBetting);
router.get('/search',ModelBettingController.searchGames)
router.post('/casino_item_add', ModelBettingController.CasinoItemAdd)
router.post('/create-category', ModelBettingController.CreateCategory)
router.post('/casino_item_update', ModelBettingController.CasinoItemSingleUpdate)
router.get('/get-all-category', ModelBettingController.GetAllCategory)
router.get('/games/:id', ModelBettingController.ShowGameListById)
router.get('/get_all_provider', ModelBettingController.GetAllProvider)
router.post('/user_balance',Refresh_blance.refreshBalance)
router.get('/user-history/:id',ModelBettingController.UserHistory)
router.post("/launch_game", ModelBettingController.launchGame);
router.post("/game-update-serial", ModelBettingController.updateSerialNumber);
router.post("/game-update-category", ModelBettingController.updateCategoryGameByID);
router.get("/New-table-categories", ModelBettingController.getCategoriesWithGamesAndProviders);
router.get("/New-table-Games-with-Providers", ModelBettingController.getCategoriesWithProviders);
router.get("/New-Games-with-Providers-By-Category", ModelBettingController.getCategoriesWithProvidersGameList);


router.post("/legal",blank.tnx)
// router.post("/bnct",blnc)




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

//  router.get('/odds-sports/:key', ModelBettingController.getOddsSports);
 router.get('/OddSync', ModelBettingController.OddSync);
router.post('/update-json', OddBettingController.updateJson);


// bank
router.post("/update-bank/:id",BankController.UpdateBank)
router.post("/delete-bank",BankController.DeleteBank)






router.get("/daily-wager", getDailyWager);




module.exports = router