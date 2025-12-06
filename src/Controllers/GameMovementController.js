const Category = require('../models/Category');
const GameListTable = require('../models/GameListTable');
const BetProviderTable = require('../models/BetProviderTable');

// Move games between categories and update provider list
exports.moveGamesToAnotherCategoryAndUpdateProviderList = async (req, res) => {
  console.log('Move games request:', req.body);
  
  try {
    const {
      fromCategoryName,
      toCategoryName,
      gamesToMove // array of games: [{ g_code, p_code }]
    } = req.body;

    if (!fromCategoryName || !toCategoryName || !Array.isArray(gamesToMove)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required information: fromCategoryName, toCategoryName, and gamesToMove.' 
      });
    }

    // Find both categories
    const fromCategory = await Category.findOne({ category_name: fromCategoryName });
    const toCategory = await Category.findOne({ category_name: toCategoryName });
    
    console.log('Found categories:', { fromCategory, toCategory });
    
    if (!fromCategory || !toCategory) {
      return res.status(404).json({ 
        success: false, 
        message: 'One or both categories not found.' 
      });
    }

    // Filter games to be moved
    const gamesToRemove = new Set(gamesToMove.map(game => game.g_code + game.p_code));
    console.log('Games to remove:', gamesToRemove);
    
    // Remove games from old category
    fromCategory.gamelist = fromCategory.gamelist.filter(
      game => !gamesToRemove.has(game.g_code + game.p_code)
    );
    console.log('Updated fromCategory gamelist:', fromCategory.gamelist);
    
    // Add games to new category (avoid duplicates)
    const existingSet = new Set(toCategory.gamelist.map(game => game.g_code + game.p_code));
    console.log("Existing games in target category:", existingSet);
    
    const newGames = gamesToMove.filter(
      game => !existingSet.has(game.g_code + game.p_code)
    );
    console.log("New games to add:", newGames);
    
    toCategory.gamelist.push(...newGames);

    // Update GameListTable with category_name change
    for (let game of gamesToMove) {
      console.log("Updating GameListTable for:", game);
      
      await GameListTable.updateMany(
        { g_code: game.g_code, p_code: game.p_code },
        {
          category_name: toCategoryName,
          g_type: toCategory.g_type,
          new_brand: game.g_code,
          new_category_name: toCategoryName,
          updatetimestamp: new Date()
        }
      );
    }

    // Update BetProviderTable based on g_type
    await updateProviderGType(toCategory.g_type, gamesToMove);

    // Save changes to categories
    await fromCategory.save();
    await toCategory.save();

    res.status(200).json({
      success: true,
      message: 'Games successfully moved to new category and providers updated.',
      movedGames: gamesToMove,
      fromCategory: fromCategory.category_name,
      toCategory: toCategory.category_name
    });

  } catch (err) {
    console.error('Error moving games:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error occurred while moving games.',
      error: err.message 
    });
  }
};

// Helper function to update BetProviderTable
async function updateProviderGType(newGType, gamesToMove) {
  try {
    // Get all unique provider codes from the games being moved
    const providerCodes = [...new Set(gamesToMove.map(game => game.p_code))];
    
    console.log("Updating providers for p_codes:", providerCodes, "with g_type:", newGType);

    // Find all providers that have these provider codes
    const providers = await BetProviderTable.find({ 
      providercode: { $in: providerCodes } 
    });

    console.log("Found providers to update:", providers.length);

    for (let provider of providers) {
      // Check if the provider already has this g_type
      const hasGType = provider.g_type.includes(newGType);
      
      if (!hasGType) {
        // If provider doesn't have this g_type, add it
        const updatedGTypes = [...new Set([...provider.g_type, newGType])];
        
        await BetProviderTable.updateOne(
          { _id: provider._id },
          { 
            g_type: updatedGTypes,
            updatetimestamp: new Date()
          }
        );
        
        console.log(`Updated provider ${provider.providercode}: added g_type ${newGType}`);
      } else {
        console.log(`Provider ${provider.providercode} already has g_type ${newGType}`);
      }
    }

  } catch (error) {
    console.error('Error updating BetProviderTable:', error);
    throw error;
  }
}