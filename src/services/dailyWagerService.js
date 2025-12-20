// services/dailyWagerService.js
const axios = require('axios');
const md5 = require('md5');
const dayjs = require('dayjs');
const PROVIDERS = require('../utils/providers');

const LOG_URL = "http://fetch.336699bet.com";          // 예: https://api.provider.com
const OPERATOR_CODE ='rbdb';   // ccjr
const SECRET_KEY = '9332fd9144a3a1a8bd3ab7afac3100b0';

exports.getDailyWager = async (dateF, dateT) => {

  // ✅ 7 দিনের বেশি কি না চেক
  const diff = dayjs(dateT).diff(dayjs(dateF), 'day');
  if (diff > 7) {
    throw new Error('সর্বোচ্চ ৭ দিনের ডাটা পাওয়া যাবে');
  }

  // ✅ Signature তৈরি
  const signature = md5(OPERATOR_CODE + SECRET_KEY).toUpperCase();

  const results = [];

  for (const provider of PROVIDERS) {
    try {
      const response = await axios.get(`${LOG_URL}/getDailyWager.ashx`, {
        params: {
          operatorcode: OPERATOR_CODE,
          dateF,
          dateT,
          providercode: provider,
          signature
        },

        timeout: 15000
      });
      console.log(`${LOG_URL}/getDailyWager.ashx`, {
        params: {
          operatorcode: OPERATOR_CODE,
          dateF,
          dateT,
          providercode: provider,
          signature
        }
      });
console.log("response", response);
      results.push({
        provider,
        success: true,
        data: response.data
      });

    } catch (err) {
      results.push({
        provider,
        success: false,
        error: err.message
      });
    }
  }

  return results;
};
