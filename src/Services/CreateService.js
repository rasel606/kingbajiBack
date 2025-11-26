const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/appError');
const crypto = require('crypto');

const JWT_SECRET = "Kingbaji";

// ডিভাইস ID জেনারেট করার ফাংশন
const generateDeviceId = (req) => {
  return crypto.createHash('md5')
    .update(req.ip + req.headers['user-agent'])
    .digest('hex');
};

// টোকেন জেনারেট ফাংশন (ডিভাইস ID সহ)
const generateToken = (email, deviceId) => {
  return jwt.sign({ email, deviceId }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

// const createUser = async (req, dataModel) => {
//   const { email, password, phone, referredBy, userId, } = req.body;

//   // Check if user exists
//   const existingUser = await dataModel.findOne({ $or: [{ email }, { phone }, { userId }] });
//   if (existingUser) {
//     throw new AppError("User already exists with this email or mobile", 400);
//   }

//   // Generate unique userId and referralCode
//   let referralCode;
//   let unique = false;
//   while (!unique) {
//     referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
//     const exists = await dataModel.findOne({ referralCode });
//     if (!exists) unique = true;
//   }

//   // ডিভাইস ID জেনারেট করুন (লগিনের জন্য প্রস্তুত)
//   const deviceId = generateDeviceId(req);

//   // Create new user (pre-save hook will hash password)
//   const newUser = await dataModel.create({
//     email,
//     phone,
//     password, // raw password, hook will hash
//     userId: userId || referralCode, // যদি userId দেয়া না থাকে তাহলে referralCode ব্যবহার করুন
//     referralCode,
//     referredBy,
    
//     // সেশন ডাটা (ইনিশিয়ালি খালি)
//     currentSession: null,
//     isLoggedIn: false
//   });

//   // Generate token (লগিনের জন্য প্রস্তুত)
//   const token = generateToken(newUser.email, deviceId);

//   return {
//     success: true,
//     message: "User created successfully",
//     data: {
//       role: newUser.role,
//       user: newUser,
//       token, // ক্লায়েন্ট লগিন করতে এই টোকেন ব্যবহার করতে পারে
//       deviceId // ক্লায়েন্ট স্টোর করার জন্য
//     }
//   };
// };

const createUser = async (req, dataModel, userType) => {
  const { email, password, firstName, mobile, referredBy, userId, lastName, permissions } = req.body;

  // Check if user exists
  const existingUser = await dataModel.findOne({ 
    $or: [{ email }, { userId }, { mobile }] 
  });
  
  if (existingUser) {
    throw new AppError(`${userType} already exists with this email, mobile or userId`, 400);
  }

  // Generate unique userId if not provided
  let finalUserId = userId;
  if (!finalUserId) {
    let isUnique = false;
    while (!isUnique) {
      const prefix = userType === 'Admin' ? 'ADM' : userType === 'SubAdmin' ? 'SUB' : 'AFF';
      finalUserId = prefix + Math.random().toString(36).substring(2, 8).toUpperCase();
      const exists = await dataModel.findOne({ userId: finalUserId });
      if (!exists) isUnique = true;
    }
  }

  // Create user data object
  const userData = {
    email,
    password,
    firstName,
    mobile,
    userId: finalUserId,
    referredBy
  };

  // Add optional fields
  if (lastName) userData.lastName = lastName;
  if (permissions) userData.permissions = permissions;
  if (userType === 'SubAdmin' && req.admin) {
    userData.createdBy = req.admin._id;
  }

  // Create new user
  const newUser = await dataModel.create(userData);
  const CreatedUser = await dataModel.findOne({ _id: newUser.createdBy }) || 'Self-registered';
  console.log(`${userType} created: ${newUser.email} by ${CreatedUser}`);
  // Generate token (লগিনের জন্য প্রস্তুত)
  const deviceId = generateDeviceId(req);
  const token = generateToken(newUser.email, deviceId, newUser.role);

  return {
    success: true,
    message: `${userType} created successfully`,
    data: {
      user: CreatedUser,
      token,
      deviceId
    }
  };
};

module.exports = { createUser, generateToken, generateDeviceId };