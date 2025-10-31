

// utils/generateCode.js
const generateVerificationCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const generateExpiryTime = (minutes = 10) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};


module.exports = {
  generateVerificationCode,
  generateExpiryTime,

};


// utils/generateCode.js
// const User = require('../Models/User');

// const generateVerificationCode = () => {
//   return Math.floor(1000 + Math.random() * 9000).toString();
// };

// const generateExpiryTime = (minutes = 10) => {
//   return new Date(Date.now() + minutes * 60 * 1000);
// };

// const generateUserId = async (userId) => {
//   let userId;
//   let exists = true;
  
//   while (exists) {
//     // Generate 8-character alphanumeric ID

//     const user = await User.findOne({ userId });
//         userId = user.userId;
//     exists = !!user;
//   }
  
//   return userId;
// };

// module.exports = {
//   generateVerificationCode,
//   generateExpiryTime,
//   generateUserId
// };