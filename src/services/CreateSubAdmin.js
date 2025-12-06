const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

const crypto = require("crypto");
const SubAdmin = require("../Models/SubAdminModel");
const User = require('../Models/User');
const SocialLink = require('../Models/SocialLink');
const PaymentGateWayTable = require('../Models/PaymentGateWayTable');
const WidthralPaymentGateWayTable = require('../Models/WidthralPaymentGateWayTable');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// const User = require("../Models/User");


const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET || "Kingbaji";
const generateToken = (email) => {
  return jwt.sign({ email }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};



// exports.registerSubAdmin =  catchAsync(async (req, res) => {
//   try {
//     const { email, phone, password, countryCode, referredBy } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ success: false, message: "Please enter all required fields" });
//     }

//     // Normalize email
//     const normalizedEmail = email.toLowerCase();

//     // Check if user already exists
//     const existingUser = await SubAdmin.findOne({ email: normalizedEmail });
//     if (existingUser) {
//       return res.status(400).json({ success: false, message: "User already exists" });
//     }

//     // Optionally: check for existing phone
//     // const existingPhone = await SubAdmin.findOne({ phone });
//     // if (existingPhone) {
//     //   return res.status(400).json({ success: false, message: "Phone already registered" });
//     // }

//     // Generate unique referral code
//     let referredCode;
//     let codeExists = true;

//     while (codeExists) {
//       referredCode = Math.random().toString(36).substring(2, 8);
//       codeExists = await SubAdmin.findOne({ referralCode: referredCode });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, saltRounds);

//     // Generate user & referral IDs
//     const SubAdminId = Math.random().toString(36).substring(2, 11);
//     const baseUrl = "https://kingbaji.live/?ref=";
//     const agentbaseUrl = "http://coag.kingbaji.live/?ref=";
//     const affiliatebaseUrl = "http://co.kingbaji.live/?ref=";

//     const user_referredLink = baseUrl + referredCode;
//     const agent_referred_Link = agentbaseUrl + referredCode;
//     const affiliate_referredsLink = affiliatebaseUrl + referredCode;

//     // Create new SubAdmin
//     const newUser = new SubAdmin({
//       email: normalizedEmail,
//       phone,
//       countryCode,
//       referredBy,
//       referralCode: referredCode,
//       userId: referredCode,
//       password: hashedPassword,
//       balance: 0,
//       SubAdminId,
//       isActive: true,
//       user_referredLink,
//       agent_referredLink: agent_referred_Link,
//       affiliate_referredLink: affiliate_referredsLink,
//     });

//     await newUser.save();

//     // Fetch user details via aggregation
//     const response = await SubAdmin.aggregate([
//       { $match: { email: normalizedEmail } },
//       {
//         $project: {
//           email: 1,
//           phone: 1,
//           countryCode: 1,
//           balance: 1,
//           referredBy: 1,
//           user_referredLink: 1,
//           referralCode: 1,
//           user_role: 1,
//         },
//       },
//     ]);

//     if (!response || response.length === 0) {
//       return res.status(500).json({ success: false, message: "User not found after creation" });
//     }

//     const userDetails = response[0];

//     const defaultGateways = [
//       {
//         gateway_name: "Bkash",
//         image_url: "https://i.ibb.co/0RtD1j9C/bkash.png",
//         payment_type: "Cashout",
//         gateway_Number: "01700000000",
//       },
//       {
//         gateway_name: "Nagad",
//         image_url: "https://i.ibb.co/2YqVLj1C/nagad-1.png",
//         payment_type: "Cashout",
//         gateway_Number: "01700000000",
//       },
//       {
//         gateway_name: "Rocket",
//         image_url: "https://i.ibb.co/Rp5QFcm9/rocket.png",
//         payment_type: "Cashout",
//         gateway_Number: "01700000000",
//       },
//       {
//         gateway_name: "Upay",
//         image_url: "https://i.ibb.co/5WX9H0Tw/upay.png",
//         payment_type: "Cashout",
//         gateway_Number: "01700000000",
//       },
//     ];

//     const timestamp = new Date();

//     // Create entries for both payment gateway tables
//     const gatewayPayload = defaultGateways.map((gateway) => ({
//       user_role: userDetails.user_role,
//       email: userDetails.email,
//       gateway_name: gateway.gateway_name,
//       gateway_Number: gateway.gateway_Number,
//       payment_type: gateway.payment_type,
//       image_url: gateway.image_url,
//       referredBy: userDetails.referralCode,
//       start_time: null,
//       end_time: null,
//       minimum_amount: 0,
//       maximum_amount: 0,
//       is_active: true,
//       timestamp,
//       updatetime: timestamp,
//     }));

//     await Promise.all([
//       PaymentGateWayTable.insertMany(gatewayPayload),
//       WidthralPaymentGateWayTable.insertMany(gatewayPayload),
//     ]);

//     // Generate JWT Token
//     const token = jwt.sign(
//       { email: userDetails.email, user_role: userDetails.user_role },
//       JWT_SECRET,
//       { expiresIn: "30d" }
//     );

//         res.status(201).json({
//     success: true,
//     data: {
//       userId: userDetails.userId,
//       username: userDetails.userId,
//       email: userDetails.email,
//       firstName: userDetails.firstName,
//       lastName: userDetails.lastName,
//       referralCode: userDetails.referralCode,
//       phone: userDetails.phone,
//           countryCode: userDetails.countryCode,
//           balance: userDetails.balance,
//           referralCode: userDetails.referralCode,
//           referralBy: user.referralBy,
//           referredLink: userDetails.referredLink,
//           user_referredLink: userDetails.user_referredLink,
//           agent_referredLink: agent_referred_Link,
//           affiliate_referredLink: affiliate_referredsLink,
//           referralCode: userDetails.referralCode,
//       token: generateToken(user.userId),
//     }
//   });
//   } catch (error) {
//     console.error("❌ Error in registerSubAdmin:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// });




exports.registerSubAdmin = catchAsync(async (req, res, next) => {
  try {
    console.log("📥 Creating admin with data:", req.body);
    
    const result = await createUser(req, AdminModel, 'Admin');
    
    if (result.success) {
      console.log("✅ Admin created successfully");

      // Set cookies
      res.cookie('adminToken', result.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
      });

      res.cookie('adminDeviceId', result.data.deviceId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
      });

      res.status(201).json({
        data: result.data,
        message: result.message,
        success: true,
      });
    }
  } catch (err) {
    next(err);
  }
});

// Check if admin exists endpoint
// exports.CheckSubAdminExists = catchAsync(async (req, res, next) => {
//   try {
//     const existingAdmin = await AdminModel.findOne({
//       $or: [
//         { email: req.body.email },
//         { mobile: req.body.mobile },
//         { userId: req.body.userId }
//       ]
//     });

//     if (existingAdmin) {
//       return res.status(200).json({
//         exists: true,
//         message: "Admin already exists with this email, mobile, or userId",
//         data: {
//           email: existingAdmin.email,
//           mobile: existingAdmin.mobile,
//           userId: existingAdmin.userId
//         }
//       });
//     }

//     res.status(200).json({
//       exists: false,
//       message: "No admin found with these credentials"
//     });
//   } catch (error) {
//     next(error);
//   }
// });


// SubAdmin login
exports.SubAdminLogin = catchAsync(async (req, res, next) => {
  try {
    console.log("📥 Login admin with data:", req.body);
    
    const result = await loginUser(req, AdminModel, 'Admin');
    
    // Set cookies
    res.cookie('adminToken', result.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.cookie('adminDeviceId', result.data.deviceId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    console.log("✅ Admin login successful for device:", result.data.deviceId);
    res.json({ 
      data: result.data, 
      message: result.message, 
      success: result.success 
    });
  } catch (err) {
    next(err);
  }
});


// SubAdmin logout
exports.Logout = catchAsync(async (req, res, next) => {
  try {
    const result = await logoutUser(req, AdminModel, 'Admin');
    
    // Clear cookies
    res.clearCookie('adminToken');
    res.clearCookie('adminDeviceId');
    
    res.json({ 
      message: result.message, 
      success: result.success 
    });
  } catch (err) {
    next(err);
  }
});

exports.GetProfile = catchAsync(async (req, res, next) => {
  try {
    await verifyUserSession(req, AdminModel, 'Admin');
    const result = await getUserProfile(req, AdminModel, 'Admin');
    
    res.json({ 
      data: result.data, 
      message: result.message, 
      success: result.success 
    });
  } catch (err) {
    next(err);
  }
});

// Get active sessions (Admin only)
exports.GetActiveSessions = catchAsync(async (req, res, next) => {
  try {
    const result = await getActiveSessions(AdminModel, 'Admin');
    
    res.json({ 
      data: result.data, 
      count: result.count,
      message: result.message, 
      success: result.success 
    });
  } catch (err) {
    next(err);
  }
});


// Force logout users
exports.ForceLogout = catchAsync(async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await forceLogoutUser(userId, AdminModel, 'Admin');
    
    res.json({ 
      message: result.message, 
      previousDevice: result.previousDevice,
      success: result.success 
    });
  } catch (err) {
    next(err);
  }
});


// Check if user exists
exports.CheckExists = catchAsync(async (req, res, next) => {
  try {
    const existingAdmin = await AdminModel.findOne({ 
      $or: [
        { email: req.body.email },
        { mobile: req.body.mobile },
        { userId: req.body.userId }
      ]
    });

    if (existingAdmin) {
      return res.status(200).json({
        exists: true,
        message: "Admin already exists with this email, mobile, or userId",
        data: {
          email: existingAdmin.email,
          mobile: existingAdmin.mobile,
          userId: existingAdmin.userId
        }
      });
    }

    res.status(200).json({
      exists: false,
      message: "No admin found with these credentials"
    });
  } catch (error) {
    next(error);
  }
});




exports.verifyPhoneManually = async (req, res) => {
  try {
    const { userId, phoneNumber } = req.body;
    console.log(req.body);
    // Validate input
    if (!userId || !phoneNumber) {
      return res.status(400).json({ error: 'Missing userId or phoneNumber' });
    }

    // Find user
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const phoneEntry = user.phone.find(p => p.number === phoneNumber);
    // console.log("1 new",phoneEntry);
    if (!phoneEntry) {
      return res.status(404).json({ error: 'Phone number not found for user' });
    }
    console.log(!phoneEntry.verified, "1 new", phoneEntry);
    // Check if already verified
    if (!phoneEntry.number) {
      return res.status(400).json({ error: 'Phone number already verified' });
    }
    console.log(phoneEntry.verified, "new", user.isVerified);
    // Update verification status
    phoneEntry.verified = true;
    phoneEntry.verificationCode = undefined;
    phoneEntry.verificationExpiry = undefined;
    user.isVerified.phone = true;


    // Save changes
    await user.save();
    console.log("new", user);
    res.json({ success: true, message: 'Phone verified by admin' });

  } catch (error) {
    console.error('Admin verification error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};



exports.verifyEmailManually = async (req, res) => {
  try {
    const { userId } = req.body;
    console.log(req.body);
    // Validate input
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId or phoneNumber' });
    }

    // Find user
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    console.log(req.body);


    // Update verification status

    user.isVerified.email = true;


    // Save changes
    await user.save();
    console.log("new", user);
    res.json({ success: true, message: 'Email verified by admin' });

  } catch (error) {
    console.error('Admin verification error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};




exports.changePasswordUserByAdmin = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    console.log(userId, newPassword);
    // Validate input
    if (!userId || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "User ID and new password are required"
      });
    }
    console.log(userId, newPassword);
    // Find the user
    const user = await User.findOne({ userId: userId.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    console.log(user.userId, newPassword);
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and save
    user.password = hashedPassword;
    user.updatetimestamp = Date.now();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (error) {
    console.error('Admin password change error:', error);
    res.status(500).json({
      success: false,
      message: "Server error during password change"
    });
  }
};





exports.changeEmailUserByAdmin = async (req, res) => {
  try {
    const { userId, newEmail } = req.body;
    console.log(userId, newEmail);
    // Validate input
    if (!userId || !newEmail) {
      return res.status(400).json({
        success: false,
        message: "User ID and new password are required"
      });
    }
    console.log(userId, newEmail);
    // Find the user
    const user = await User.findOne({ userId: userId.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    console.log(user.userId, newEmail);
    // Hash new password


    // Update password and save
    user.email = email;
    user.isVerified.email = true;
    user.updatetimestamp = Date.now();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email updated successfully"
    });

  } catch (error) {
    console.error('Admin Email change error:', error);
    res.status(500).json({
      success: false,
      message: "Server error during Email change"
    });
  }
};






exports.updateAndcreateSocialLinks = async (req, res) => {

  
  try {
    console.log(req.body);
    const { telegram, facebook, email,userEmail,referralCode } = req.body;
    const updateData = {};
    if (req.body.telegram !== undefined) updateData.telegram = telegram;
    if (req.body.facebook !== undefined) updateData.facebook = facebook;
    if (req.body.email !== undefined) updateData.email = email;

    const newSubAdmin = await SubAdmin.findOne({ referralCode,email:userEmail });

    const socialLink = await SocialLink.findOneAndUpdate(
      { referredBy: newSubAdmin.referralCode, email: newSubAdmin.email },
      updateData,
      { new: true, upsert: true }
    );

    res.status(200).json({ message: "Social links updated successfully", socialLink });
  } catch (error) {
    res.status(400).send(error.message);
  }
}



exports.SubAdminDelate = async (req, res) => {
  try {
    const {email,balance } = req.body;
    console.log("social",req.body);
    const newSubAdmin = await SubAdmin.findOne({ email });
    console.log("newSubAdmin",newSubAdmin);
    if (!newSubAdmin) return res.send({});

    const delateAdmin = await SubAdmin.findOneAndUpdate({email: newSubAdmin.email}, { balance: balance }, { new: true });
    console.log(delateAdmin);
    //  const delateAdminDeposit = await PaymentGateWayTable.deleteOne({ referredBy: newSubAdmin.referralCode, email: newSubAdmin.email });
    //  const delateAdminWidthrow = await WidthralPaymentGateWayTable.deleteOne({ referredBy: newSubAdmin.referralCode, email: newSubAdmin.email });
    //  console.log(delateAdminDeposit,delateAdminWidthrow);
    // res.send("delate success",newSubAdmin); 
  } catch (error) {
    console.log(error);
    // res.status(500).send('Server error');
  }
}

