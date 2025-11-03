// routes/gameRoutes.js
const express = require('express');

// const gameController = require('../Controllers/GameListControllers');
const ModelBettingController = require('../Controllers/ModelBettingController');
const GameListControllers = require('../Controllers/GameListControllers');
const getPlayerUserGameData = require('../Services/getPlayerUserGameData');
const Refresh_blance = require('../Controllers/Refresh_blance');
const{ auth }= require('../MiddleWare/auth');
const router = express.Router();

// API 1: Get all game data (categories, providers, games, featured, hot games)
// router.get('/game-data', gameController.getCompleteGameData);
router.post('/game_g_type_update', ModelBettingController.updateGTypeList);


router.get('/user_balance',auth,Refresh_blance.refreshBalance)

router.get('/New-table-Games-with-Providers', getPlayerUserGameData.getCategoriesWithProviders);

router.get('/New-Games-with-Providers-By-Category', getPlayerUserGameData.getGamesWithProvidersByCategory);
router.get('/get-games-by-category', getPlayerUserGameData.getGamesWithProvidersByCategory);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/game-list-filters', GameListControllers.getGameListFilters);
router.get('/game-cetagory', GameListControllers.GetBettingCategory);






//------------------------------------------------------------------------------------------------------------------//



router.get('/betting-history',auth, GameListControllers.getBettingRecords);
// router.get('/betting-records/:id',auth, authenticate, GameListControllers.getBettingRecordDetails);
//--------------------------------------------------------------------------------------------------------------//

// API 2: Launch game
// router.post('/launch-game', gameController.launchGame);

module.exports = router;