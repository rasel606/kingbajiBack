const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/appError');

const JWT_SECRET = process.env.JWT_SECRET || "Kingbaji";

const generateToken = (email) => {
  return jwt.sign({ email }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};


exports.loginUser = async (req, dataModel) => {
  const { email, password } = req.body;
console.log("loginUser email",email,password)
  // 1. Find user
  const user = await dataModel.findOne({ email }).select('+password');
  console.log("loginUser",user);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // 2. Validate password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  console.log(isPasswordValid);
  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 401);
  }
  user.lastLogin = new Date();
  await user.save();
  // 3. Generate token


  // 4. Return safe user data
  return {
    success: true,
    message: "Login successful",
    data: {
      userId: user.userId,
      email: user.email,
      mobile: user.mobile,
      referredCode: user.referredCode,
      token: generateToken(user.email)
    },
  };
};






exports.AdminProfile = async (req, dataModel) => {
  const userId = req.user.email;

  // 1. Find user
  const user = await dataModel.findOne({ email: userId }).select('-password');
  console.log(user);
  if (!user) {
    throw new AppError("User not found", 404);
  }


  return {

    message: "User Profile successful",
    data: {
      userId: user.userId,
      email: user.email,
      role: user.role,
      mobile: user.mobile,
      IsActive:user.IsActive,
      balance:user.balance,
      referralCode: user.referralCode,
    },
    
  };
};


