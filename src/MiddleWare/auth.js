// const jwt = require('jsonwebtoken');
// const asyncHandler = require('express-async-handler');
// const User = require('../Models/User');
// const JWT_SECRET = "Kingbaji";
// const auth = asyncHandler(async (req, res, next) => {
//   let token;

//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith('Bearer')
//   ) {
//     try {
//       token = req.headers.authorization.split(' ')[1];
//       console.log(token);
//       const decoded = jwt.verify(token,JWT_SECRET);

//       console.log(decoded);
//       req.user = await User.findOne({userId:decoded.id}).select('-password');
//       if (!req.user) {
//         res.status(401);
//         throw new Error('Not authorized, affiliate not found');
//       }
//       next();
//     } catch (error) {
//       console.error(error);
//       res.status(401);
//       throw new Error('Not authorized');
//     }
//   }

//   if (!token) {
//     res.status(401);
//     throw new Error('Not authorized, no token');
//   }
// });

// module.exports = { auth };




// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AdminModel = require('../models/AdminModel');
const JWT_SECRET = "Kingbaji";

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    console.log("Auth Header:", authHeader);
    
    const token = authHeader?.split(" ")[1];
    console.log("Token:", token);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded token:", decoded);
    
    // Check if token has email (admin tokens) or userId (user tokens)
    let user;
    
    if (decoded.email) {
      // Try to find admin first
      user = await AdminModel.findOne({ email: decoded.email }).select('-password');
      
      // If not admin, try User model
      if (!user) {
        user = await User.findOne({ email: decoded.email }).select('-password');
      }
    } else if (decoded.userId) {
      // Token has userId, look up by userId
      user = await User.findOne({ userId: decoded.userId }).select('-password');
    } else if (decoded.id) {
      // Token has id, look up by userId
      user = await User.findOne({ userId: decoded.id }).select('-password');
    }
    
    console.log("Found user:", user ? user.email || user.userId : 'Not found');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or user not found.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(401).json({
      success: false,
      message: 'Token is invalid.',
      error: error.message
    });
  }
};

module.exports = { protect: auth, auth };