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
const JWT_SECRET = "Kingbaji";
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
        console.log("userId", authHeader);
    // console.log("userId :            1", userId);
    const token = authHeader?.split(" ")[1];
    console.log("userId", token);
    
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, "Kingbaji");
      console.log("decoded", decoded.userId);
      const decodedId = decoded?.userId;
      
      const user = await User.findOne({ userId: decodedId }).select('-password');
      console.log("user", user);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token is invalid.'
    });
  }
};

module.exports = { auth };