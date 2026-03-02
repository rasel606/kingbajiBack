// src/utils/geoip.js
// IP থেকে Geo location বের করার হেল্পার (free API)
const axios = require('axios');

async function getGeoFromIP(ip) {
  try {
    // Demo: ip-api.com (no key needed, limited)
    const url = `http://ip-api.com/json/${ip}`;
    const { data } = await axios.get(url);
    if (data.status === 'success') {
      return {
        country: data.country,
        city: data.city,
        region: data.regionName,
        lat: data.lat,
        lon: data.lon
      };
    }
    return {};
  } catch (err) {
    return {};
  }
}

module.exports = { getGeoFromIP };
