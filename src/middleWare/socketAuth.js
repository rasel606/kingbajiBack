// const jwt = require('jsonwebtoken');
// const User = require('../Models/User');
// const SubAdmin = require('../Models/SubAdminModel');

// const JWT_SECRET = process.env.JWT_SECRET || "Kingbaji";
// module.exports = async (socket, next) => {
//   console.log(socket.handshake.auth.token);
//   try {
//     const token = socket.handshake.auth.token;
//     if (!token) {
//       throw new Error('Authentication error: No token provided');
//     }
// console.log(token);
//     const decoded = jwt.verify(token,JWT_SECRET);
//     console.log("socket.handshake.auth.token",decoded);
//     const user = await SubAdmin.findOne({ email: decoded.email }) || await User.findOne({ email: decoded.userId });
//     console.log("socket.handshake.auth.email",user.email);
//     if (!user) {
//       throw new Error('Authentication error: User not found');
//     }

//     socket.user = user;
//     console.log('Authentication found',socket.user.email);
//     next();
//   } catch (err) {
//     next(new Error('Authentication error: ' + err.message));
//   }
// };