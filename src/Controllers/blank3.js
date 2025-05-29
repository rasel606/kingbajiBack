const crypto = require('crypto');
// const { operatorCode, secretKey } = require('../config');


const axios = require('axios');
// const { logUrl, operatorCode } = require('../config');
// const { generateSignature } = require('../utils/signature');

const Bet = require('../Models/Bet');
// const service = require('../services/bettingService');




// const logUrl = 'http://fetch.336699bet.com';
const operatorCode = 'rbdb';
const secretKey = '9332fd9144a3a1a8bd3ab7afac3100b0';

const generateSignature = () => {
  return crypto.createHash('md5').update(operatorCode + secretKey).digest('hex').toUpperCase();
};

const fetchBettingHistory = async () => {
  const logUrl = 'http://fetch.336699bet.com';
const operatorCode = 'rbdb';
const secretKey = '9332fd9144a3a1a8bd3ab7afac3100b0';
  const url = `http://fetch.336699bet.com/fetchbykey.aspx?operatorcode=${operatorCode}&versionkey=0&signature=${generateSignature()}`;
  console.log("getHistory",url);
  const res = await axios.get(url);
  return res.data;
};

const fetchArchivedBettingHistory = async () => {
  const logUrl = 'http://fetch.336699bet.com';
const operatorCode = 'rbdb';
const secretKey = '9332fd9144a3a1a8bd3ab7afac3100b0';
  const url = `http://fetch.336699bet.com/fetchArchieve.aspx?operatorcode=${operatorCode}&versionkey=0&signature=${generateSignature()}`;
  console.log("archived-history",url);
  const res = await axios.get(url);
  return res.data;
};

const markBets = async (tickets) => {
      const logUrl = 'http://fetch.336699bet.com';
const operatorCode = 'rbdb';
const secretKey = '9332fd9144a3a1a8bd3ab7afac3100b0';
  const res = await axios.post(`http://fetch.336699bet.com/markbyjson.aspx`, {
    operatorcode: operatorCode,
    ticket: tickets.join(','),
    signature: generateSignature(),
  });

  console.log(`http://fetch.336699bet.com/markArchieve.ashx`, {
    operatorcode: operatorCode,
    ticket: tickets.join(','),
    signature: generateSignature(),
});

  return res.data;
};



const markArchivedBets = async (tickets) => {
  const logUrl = 'http://fetch.336699bet.com';
const operatorCode = 'rbdb';
const secretKey = '9332fd9144a3a1a8bd3ab7afac3100b0';
  const res = await axios.post(`http://fetch.336699bet.com/markArchieve.ashx`, {
    operatorcode: operatorCode,
    ticket: tickets.join(','),
    signature: generateSignature(),
  });

  console.log(`http://fetch.336699bet.com/markArchieve.ashx`, {
    operatorcode: operatorCode,
    ticket: tickets.join(','),
    signature: generateSignature(),
  });
  return res.data;
};
const getDailyHistory = async (dateF, dateT, providerCode) => {
  const logUrl = 'http://fetch.336699bet.com';
  const startDate = new Date(dateF);
  const endDate = new Date(dateT);
  const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  if (diffDays > 7) throw new Error('Date range cannot exceed 7 days');

  const url = `http://fetch.336699bet.com/getDailyWager.ashx?operatorcode=${operatorCode}&dateF=${dateF}&dateT=${dateT}&providercode=${providerCode}&signature=${generateSignature()}`;

  console.log("getDailyHistory",url);
  const res = await axios.get(url,{
    headers: {
      "Content-Type": "application.json"
    }
  });

  console.log("getDailyHistory",res.data);
  return res.data;
};






exports.getHistory = async (req, res) => {
  try {
    const data = await fetchBettingHistory();
    if (data.errCode === '0' && data.result) {
      const records = JSON.parse(data.result);
      for (const [index, r] of records.entries()) {
        await Bet.findOneAndUpdate(
          { ticketId: String(r.ticketid+1) },
          { data: r, marked: false },
          { upsert: true }
        );
      }
    }
    res.json(data);
  } catch (error) {
    console.error('Error in getHistory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getArchivedHistory = async (req, res) => {
  try {
    const data = await fetchArchivedBettingHistory();
    if (data.errCode === '0' && data.result) {
      const records = JSON.parse(data.result);
      for (const r of records) {
        await Bet.findOneAndUpdate(
          { ticketId: String(r.ticketid) },
          { data: r, isArchived: true, marked: false },
          { upsert: true }
        );
      }
    }
    res.json(data);
  } catch (error) {
    console.error('Error in getArchivedHistory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.markTickets = async () => {
  try {
    const { tickets } = req.body;
    if (!Array.isArray(tickets)) throw new Error('Tickets must be an array');

    const existingBets = await Bet.find({ ticketId: { $in: tickets } });
    const existingIds = existingBets.map(b => b.ticketId);
    const notFound = tickets.filter(t => !existingIds.includes(t));

    const result = await markBets(existingIds);
    if (result.errCode === '0') {
      await Bet.updateMany({ ticketId: { $in: existingIds } }, { marked: true });
    }

    res.json({
      marked: existingIds,
      notFound,
      apiResponse: result,
    });
  } catch (error) {
    console.error('Error marking tickets:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.markArchivedTickets = async (req, res) => {
  try {
    const { tickets } = req.body;
    if (!Array.isArray(tickets)) throw new Error('Tickets must be an array');

    const archivedBets = await Bet.find({ ticketId: { $in: tickets }, isArchived: true });
    const existingIds = archivedBets.map(b => b.ticketId);
    const notFound = tickets.filter(t => !existingIds.includes(t));

    const result = await markArchivedBets(existingIds);
    if (result.errCode === '0') {
      await Bet.updateMany({ ticketId: { $in: existingIds } }, { marked: true });
    }

    res.json({
      marked: existingIds,
      notFound,
      apiResponse: result,
    });
  } catch (error) {
    console.error('Error marking archived tickets:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getDailyReport = async (req, res) => {
  try {
    const { from, to, provider } = req.body;
    console.log(from, to, provider);
    const result = await getDailyHistory(from, to, provider);
    res.json(result);
  } catch (error) {
    console.Log('Error fetching daily report:', error);
    console.error('Error fetching daily report:', error);
    res.status(500).json({ error: error.message });
  }
};