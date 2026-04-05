const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const getPlayerUserGameData = require('../services/getPlayerUserGameData');
const auth = require('../middleWare/AdminAuth');
const validate = require('../middleWare/validation');

router.get('/get_categories_with_providers_and_games', validate, auth, AdminController.getCategoriesWithProvidersAndGames);
router.get('/get-games', getPlayerUserGameData.getAllGames);
router.get('/New-table-Games-with-Category-with-Providers', getPlayerUserGameData.getCategoriesWithProviders);
router.get('/New-Games-with-Providers-By-Category', getPlayerUserGameData.getGamesWithProvidersByCategory);
router.get('/categories', getPlayerUserGameData.getAllCategories);

module.exports = router;