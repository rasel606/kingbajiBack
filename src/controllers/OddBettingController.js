// File: controllers/bettingController.js
// const axios = require('axios');
// const BetHistoryTable = require('../Models/BetHistoryTable');

// // Fetch odds sports


// // Update betting JSON
// exports.updateJson = async (req, res) => {
//   const { key, id } = req.body;
//   const apiKey = process.env.BETTING_ODDS_API_KEY;
//   const regions = process.env.BETTING_ODDS_REGION;
//   const oddsFormat = process.env.BETTING_ODDS_ODDSFORMAT;

//   try {
//     const oddsUrl = `https://api.the-odds-api.com/v4/sports/${key}/odds/?apiKey=${apiKey}&regions=${regions}&markets=h2h,spreads&oddsFormat=${oddsFormat}`;
//     const odds = await fetchFromApi(oddsUrl);

//     const eventUrl = `https://api.the-odds-api.com/v4/sports/${key}/events/${id}/odds?apiKey=${apiKey}&regions=${regions}&markets=h2h,spreads&oddsFormat=${oddsFormat}`;
//     const events = await fetchFromApi(eventUrl);

//     const scoreUrl = `https://api.the-odds-api.com/v4/sports/${key}/scores/?daysFrom=1&apiKey=${apiKey}`;
//     const scores = await fetchFromApi(scoreUrl);

//     const dataToUpdate = {
//       history: JSON.stringify(odds),
//       json: JSON.stringify({ odds, events, scores }),
//     };

//     // Update MongoDB entry
//     await BetHistoryTable.updateOne({ _id: id }, { $set: dataToUpdate });

//     res.json({ return: true, message: 'Data updated successfully' });
//   } catch (error) {
//     res.status(500).json({ return: false, message: error.message });
//   }
// };
