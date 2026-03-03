// server/utils/helpers.js
// Generate a random short code
const generateShortCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Generate affiliate link
const generateAffiliateLink = (domainId, keyword, shortCode) => {
  return `https://${domainId}/af/${shortCode}/${encodeURIComponent(keyword)}`;
};

// Get landing page name from code
const getLandingPageName = (pageCode) => {
  const pages = {
    '1': 'Main',
    '2': 'Sign Up',
    '3': 'Promotion',
    '4': 'Sports',
    '5': 'CASINO',
    '6': 'Card',
    '7': 'Fishing',
    '8': 'Slot'
  };
  return pages[pageCode] || 'Main';
};

module.exports = {
  generateShortCode,
  generateAffiliateLink,
  getLandingPageName
};