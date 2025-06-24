
const Bonus = require('../Models/Bonus');


// Create a new bonus
exports.createBonus = async (req, res) => {
  try {
    const {
      name,
      description,
      bonusType,
      percentage,
      fixedAmount,
      minDeposit,
      maxBonus,
      wageringRequirement,
      validDays,
      eligibleGames,
      isActive,
      startDate,
      endDate
    } = req.body;

    // Create new Bonus document
    const bonus = new Bonus({
      name,
      description,
      bonusType,
      percentage,
      fixedAmount,
      minDeposit,
      maxBonus,
      wageringRequirement,
      validDays,
      eligibleGames,
      isActive,
      startDate,
      endDate
    });

    // Save to DB
    const savedBonus = await bonus.save();

    return res.status(201).json({
      success: true,
      message: 'Bonus created successfully',
      data: savedBonus
    });
  } catch (error) {
    console.error('Error creating bonus:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create bonus',
      error: error.message
    });
  }
}



// GET /api/bonuses
exports.getAllBonuses = async (req, res) => {
  try {
    const bonuses = await Bonus.find({isActive: true, bonusType: { $in: ['deposit', 'signup', 'referral', 'turnover', 'birthday'] }});
    res.json({
      success: true,
      data: bonuses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bonuses',
      error: error.message
    });
  }
}




// // GET /api/bonuses
// exports.getAllBonuses =  async (req, res) => {
//   try {
//     const { userId } = req.body;
//     const now = new Date();

//     // Step 1: Get all system-wide active bonuses (not expired)
//     const allBonuses = await Bonus.find({
//       isActive: true,
//       endDate: { $gt: now }
//     });

//     // ❌ No userId? Return all active bonuses
//     if (!userId) {
//       return res.status(200).json({
//         success: true,
//         message: 'All active bonuses retrieved successfully',
//         availableBonuses: allBonuses,
//         count: allBonuses.length
//       });
//     }

//     // ✅ If userId exists: get user's active and unexpired bonuses
//     const userBonuses = await UserBonus.find({
//       userId,
//       expiryDate: { $gt: now }
//     });

//     // Get claimed bonusId list
//     const claimedBonusIds = userBonuses.map(b => b.bonusId.toString());

//     // Filter out bonuses already claimed
//     const availableBonuses = allBonuses.filter(bonus =>
//       !claimedBonusIds.includes(bonus._id.toString())
//     );

//     return res.status(200).json({
//       success: true,
//       message: availableBonuses.length
//         ? 'Available bonuses retrieved successfully'
//         : 'No new bonuses available for this user',
//       availableBonuses,
//       count: availableBonuses.length
//     });

//   } catch (error) {
//     console.error('checkAvailableBonuses error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal Server Error',
//       error: error.message
//     });
//   }
// };