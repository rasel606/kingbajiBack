// middleware/auth.js
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const AgentModel = require('../models/AgentModel');

const JWT_SECRET = "Kingbaji";

const auth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Access denied. No token provided.', 401));
    }

    const decoded = jwt.verify(token, JWT_SECRET);
console.log(decoded)
    // Find user/admin by email
    const user = await AgentModel.findOne({ email: decoded.email }).select('-password');

    if (!user) {
      return next(new AppError('Token is not valid.', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new AppError('Token is not valid.', 401));
  }
};

module.exports = auth; // ✅ default export
