// const crypto = require('crypto');
// // const { operatorCode, secretKey } = require('../config');


// const axios = require('axios');
// // const { logUrl, operatorCode } = require('../config');
// // const { generateSignature } = require('../utils/signature');

// const Bet = require('../Models/Bet');
// // const service = require('../services/bettingService');




// // const logUrl = 'http://fetch.336699bet.com';
// const operatorCode = 'rbdb';
// const secretKey = '9332fd9144a3a1a8bd3ab7afac3100b0';

// const generateSignature = () => {
//   return crypto.createHash('md5').update(operatorCode + secretKey).digest('hex').toUpperCase();
// };

// const fetchBettingHistory = async () => {
//   const logUrl = 'http://fetch.336699bet.com';
//   const operatorCode = 'rbdb';
//   const secretKey = '9332fd9144a3a1a8bd3ab7afac3100b0';
//   const url = `http://fetch.336699bet.com/fetchbykey.aspx?operatorcode=${operatorCode}&versionkey=0&signature=${generateSignature()}`;
//   console.log("getHistory", url);
//   const res = await axios.get(url);
//   console.log("getHistory", res.data);
//   // markNewBettingHistory(res.data.result);
//   return res.data;
// };
// // fetchBettingHistory()

// const fetchArchivedBettingHistory = async () => {
//   const logUrl = 'http://fetch.336699bet.com';
//   const operatorCode = 'rbdb';
//   const secretKey = '9332fd9144a3a1a8bd3ab7afac3100b0';
//   const url = `http://fetch.336699bet.com/fetchArchieve.aspx?operatorcode=${operatorCode}&versionkey=0&signature=${generateSignature()}`;
//   console.log("archived-history", url);
//   const res = await axios.get(url);
//   console.log("archived", res.data);
//   return res.data;
// };
// // fetchArchivedBettingHistory()

// const markBets = async (tickets) => {
//   console.log(tickets);
//   const ticketStr = Array.isArray(tickets) ? tickets.join(',') : '';;

//   const logUrl = 'http://fetch.336699bet.com';
//   const operatorCode = 'rbdb';
//   const secretKey = '9332fd9144a3a1a8bd3ab7afac3100b0';
//   const res = await axios.post(`http://fetch.336699bet.com/markbyjson.aspx`, {
//     operatorcode: operatorCode,
//     ticket: ticketStr,
//     signature: generateSignature(),
//   });
//   console.log(res.data);

//   console.log(`http://fetch.336699bet.com/markArchieve.ashx`, {
//     operatorcode: operatorCode,
//     ticket: ticketStr,
//     signature: generateSignature(),
//   });

//   return res.data;
// };


// const fetchAndMark = async () => {
//   try {
//     const tickets = await fetchBettingHistory();
//     const result = await markTickets(tickets);
//     console.log(result);
//     // res.status(200).json({ message: result, tickets });
//   } catch (error) {
//     // res.status(500).json({ error: error.message });
//   }
// };

// // fetchAndMark()



// const markArchivedBets = async (tickets) => {
//   const logUrl = 'http://fetch.336699bet.com';
//   const operatorCode = 'rbdb';
//   const secretKey = '9332fd9144a3a1a8bd3ab7afac3100b0';
//   const res = await axios.post(`http://fetch.336699bet.com/markArchieve.ashx`, {
//     operatorcode: operatorCode,
//     ticket: tickets.join(','),
//     signature: generateSignature(),
//   });

//   console.log(`http://fetch.336699bet.com/markArchieve.ashx`, {
//     operatorcode: operatorCode,
//     ticket: tickets.join(','),
//     signature: generateSignature(),
//   });
//   console.log(res.data);
//   return res.data;
// };
// const getDailyHistory = async (dateF, dateT, providerCode) => {
//   const logUrl = 'http://fetch.336699bet.com';
//   const startDate = new Date(dateF);
//   const endDate = new Date(dateT);
//   const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
//   if (diffDays > 7) throw new Error('Date range cannot exceed 7 days');

//   const pNsignature = generateSignature();
//   const operatorCode = 'rbdb';
//   const secretKey = '9332fd9144a3a1a8bd3ab7afac3100b0';

//   const url = `http://fetch.336699bet.com/getDailyWager.ashx?operatorcode=${operatorCode}&dateF=${dateF}&dateT=${dateT}&providercode=${providerCode}&signature=${pNsignature}`;

//   console.log("getDailyHistory", url);
//   const res = await axios.get(url, {
//     headers: {
//       "Content-Type": "application.json"
//     }
//   });

//   console.log("getDailyHistory", res.data);
//   return res.data;
// };







// ///////////////////////////////////////////////////////////////////////////////////////////
// // function generateSignature(operatorcode, secret_key) {
// //   return crypto.createHash('md5')
// //     .update(operatorcode + secret_key)
// //     .digest('hex')
// //     .toUpperCase();
// // }

// const markNewBettingHistory = async () => {




//   const logUrl = 'http://fetch.336699bet.com';
//   const operatorCode = 'rbdb';
//   const secretKey = '9332fd9144a3a1a8bd3ab7afac3100b0';







//   const signature = generateSignature(operatorCode, secretKey);
//   const pNsignature = signature;
//   console.log("pNsignature", pNsignature);
//   // 1. Fetch betting history from the API
//   const response = await axios.post(`http://fetch.336699bet.com/fetchbykey.aspx?operatorcode=${operatorCode}&versionkey=0&signature=${pNsignature}`);








// const bets = JSON.parse(response.data.result);
// console.log("bets",bets);

//   const records =  bets || [];



//     console.log("records", records);
 
//   if (!records.length) {
//     return res.status(200).json({ message: 'No new records', data: [] });
//   }

//   // 3. Extract ticket ids from records
//   const ticket = records.map(record => record.id).join(',');
// console.log("ticket", ticket);

// const NewJson = JSON.stringify(
//   ticket
// )
// console.log("NewJson", NewJson);
//   // 4. Generate signature
//   const Nsignature = generateSignature(operatorCode, secretKey)
// console.log("Nsignature", Nsignature);
//   // 5. Call mark API
//   const markRes = await axios.post(`${logUrl}/markbyjson.ashx`, {
//     ticket:NewJson,
//     operatorCode: operatorCode,
//     signature:Nsignature
//   },
//   {
//     headers: {
//       "Content-Type": "application/json"
//     }
//   }
// );



//   console.log('Marked Tickets:', markRes.data);

// }
//   // console.log(response.data);

//   // return res.status(200).json(response.data);










// //////////////////////////////////////////////////////////////////////////////////



// // markNewBettingHistory();





// const markNewestBettingHistory = async () => {
//   const logUrl = "http://fetch.336699bet.com";
//   const operatorCode = "rbdb";
//   const secretKey = "9332fd9144a3a1a8bd3ab7afac3100b0";

//   // Generate Signature (Uppercase MD5)
//   const generateSignature = (operator, secret) => {
//     return crypto.createHash("md5").update(operator + secret).digest("hex").toUpperCase();
//   };

 
//     const signature = generateSignature(operatorCode, secretKey);

//     // 1. Fetch betting history
//     const fetchRes = await axios.post(
//       `${logUrl}/fetchbykey.aspx?operatorcode=${operatorCode}&versionkey=0&signature=${signature}`
//     );

//     const bets = JSON.parse(fetchRes.data.result || "[]");
//     if (!bets.length) {
//       console.log("No new betting records.");
//       return res.status(200).json({ message: "No new records", data: [] });
//     }

//     // 2. Extract ticket ids
//     const ticketIds = bets.map(record => record.id).join(",");
//     console.log("Tickets to mark:", ticketIds);

//     // 3. Generate signature for mark API
//     const markSignature = generateSignature(operatorCode, secretKey);

//     // 4. Call the mark API
//     const markRes = await axios.post(
//       `${logUrl}/markbyjson.ashx`,
//       {
//         ticket: ticketIds,
//         operatorcode: operatorCode,
//         signature: markSignature,
//       },
//       {
//         headers: { "Content-Type": "application/json" },
//       }
//     );

//     console.log("Marked Tickets Response:", markRes.data);
    
// };


// // markNewestBettingHistory();

// /////////////////////////////////////////////












// exports.getHistory = async (req, res) => {
//   try {
//     const data = await fetchBettingHistory();
//     if (data.errCode === '0' && data.result) {
//       const records = JSON.parse(data.result);
//       for (const [index, r] of records.entries()) {
//         await Bet.findOneAndUpdate(
//           { ticketId: String(r.ticketid + 1) },
//           { data: r, marked: false },
//           { upsert: true }
//         );
//       }
//     }
//     res.json(data);
//   } catch (error) {
//     console.error('Error in getHistory:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// exports.getArchivedHistory = async (req, res) => {
//   try {
//     const data = await fetchArchivedBettingHistory();
//     if (data.errCode === '0' && data.result) {
//       const records = JSON.parse(data.result);
//       for (const r of records) {
//         await Bet.findOneAndUpdate(
//           { ticketId: String(r.ticketid) },
//           { data: r, isArchived: true, marked: false },
//           { upsert: true }
//         );
//       }
//     }
//     res.json(data);
//   } catch (error) {
//     console.error('Error in getArchivedHistory:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// exports.markTickets = async () => {
//   try {
//     const { tickets } = req.body;
//     if (!Array.isArray(tickets)) throw new Error('Tickets must be an array');

//     const existingBets = await Bet.find({ ticketId: { $in: tickets } });
//     const existingIds = existingBets.map(b => b.ticketId);
//     const notFound = tickets.filter(t => !existingIds.includes(t));

//     const result = await markBets(existingIds);
//     if (result.errCode === '0') {
//       await Bet.updateMany({ ticketId: { $in: existingIds } }, { marked: true });
//     }

//     res.json({
//       marked: existingIds,
//       notFound,
//       apiResponse: result,
//     });
//   } catch (error) {
//     console.error('Error marking tickets:', error);
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.markArchivedTickets = async (req, res) => {
//   try {
//     const { tickets } = req.body;
//     if (!Array.isArray(tickets)) throw new Error('Tickets must be an array');

//     const archivedBets = await Bet.find({ ticketId: { $in: tickets }, isArchived: true });
//     const existingIds = archivedBets.map(b => b.ticketId);
//     const notFound = tickets.filter(t => !existingIds.includes(t));

//     const result = await markArchivedBets(existingIds);
//     if (result.errCode === '0') {
//       await Bet.updateMany({ ticketId: { $in: existingIds } }, { marked: true });
//     }

//     res.json({
//       marked: existingIds,
//       notFound,
//       apiResponse: result,
//     });
//   } catch (error) {
//     console.error('Error marking archived tickets:', error);
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.getDailyReport = async (req, res) => {
//   try {
//     const { from, to, provider } = req.body;
//     console.log(from, to, provider);
//     const result = await getDailyHistory(from, to, provider);
//     res.json(result);
//   } catch (error) {
//     console.Log('Error fetching daily report:', error);
//     console.error('Error fetching daily report:', error);
//     res.status(500).json({ error: error.message });
//   }
// };