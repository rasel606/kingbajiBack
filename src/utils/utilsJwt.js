// utils/jwt.js
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

const generateGameToken = (userId, gameId) => {
  return jwt.sign({ 
    id: userId, 
    gameId: gameId,
    type: 'game' 
  }, process.env.JWT_SECRET, {
    expiresIn: '2h'
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  generateToken,
  generateGameToken,
  verifyToken
};