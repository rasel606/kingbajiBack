// controllers/reportController.js
const { getDailyWager } = require('../services/dailyWagerService');

exports.dailyWagerReport = async (req, res) => {
  try {
    const { dateF, dateT } = req.query;

    if (!dateF || !dateT) {
      return res.status(400).json({
        success: false,
        message: 'dateF এবং dateT প্রয়োজন'
      });
    }

    const data = await getDailyWager(dateF, dateT);

    res.json({
      success: true,
      totalProvider: data.length,
      result: data
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
