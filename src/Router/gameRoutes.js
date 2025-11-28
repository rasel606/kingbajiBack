// routes/gameRoutes.js
const express = require('express');

// const gameController = require('../Controllers/GameListControllers');
const ModelBettingController = require('../Controllers/ModelBettingController');
const GameListControllers = require('../Controllers/GameListControllers');
const GameMovementController = require('../Controllers/GameMovementController');
const getPlayerUserGameData = require('../Services/getPlayerUserGameData');
const ProviderController = require('../Controllers/providerController');
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
router.get('/get-games', getPlayerUserGameData.getAllGames);
router.post('/move-games', GameMovementController.moveGamesToAnotherCategoryAndUpdateProviderList);

// GET /api/categories - Get all categories
router.get('/categories', getPlayerUserGameData.getAllCategories);

// GET /api/categories/:id - Get category by ID
router.get('categories/:id', getPlayerUserGameData.getCategoryById);

// POST /api/categories - Create new category
router.post('/categories', getPlayerUserGameData.createCategory);

// PUT /api/categories/:id - Update category
router.put('categories/:id', getPlayerUserGameData.updateCategory);

// DELETE /api/categories/:id - Delete category
router.delete('categories/:id', getPlayerUserGameData.deleteCategory);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/game-list-filters', getPlayerUserGameData.getAllGames);
router.get('/game-cetagory', GameListControllers.GetBettingCategory);



// GET /api/providers - Get all providers
router.get('/provider', ProviderController.getAllProviders);

// GET /api/providers/:id - Get provider by ID
router.get('/provider/:providercode', ProviderController.getProviderById);

// POST /api/providers - Create new provider
router.post('/provider', ProviderController.createProvider);

// PUT /api/providers/:id - Update provider
router.put('/provider/:id', ProviderController.updateProvider);

// DELETE /api/providers/:id - Delete provider
router.delete('/provider/:id', ProviderController.deleteProvider);



//------------------------------------------------------------------------------------------------------------------//



router.get('/betting-history',auth, GameListControllers.getBettingRecords);
// router.get('/betting-records/:id',auth, authenticate, GameListControllers.getBettingRecordDetails);
//--------------------------------------------------------------------------------------------------------------//

// API 2: Launch game
// router.post('/launch-game', gameController.launchGame);

module.exports = router;