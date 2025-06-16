
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
    const bonuses = await Bonus.find({isActive: true});
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
