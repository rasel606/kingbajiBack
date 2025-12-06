const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const axios = require("axios");
const crypto = require("crypto");
const User = require('../models/User');
// const AffiliateUser = require('../Models/AffiliateUser');
const SubAdminModel = require('../models/SubAdminModel');
const ReferralBonus = require('../models/ReferralBonus');
const { OTP } = require('../models/Opt');
const { sendSms } = require('./sendSms');
  const generateReferralCode = require('./generateReferralCode');

const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET || "Kingbaji";

// exports.register = async (req, res) => {
//   try {
//     const { userId, phone, password, countryCode, referredBy } = req.body;
//     console.log(req.body)
//     if (!userId || !phone || !password) {
//       return res.status(400).json({ success: false, message: "Missing required fields" });
//     }

//     const existingUser = await User.findOne({ userId, 'phone.number': phone });
//     console.log(existingUser)
//     if (existingUser) {
//       return res.status(409).json({ message: 'User already exists' });
//     }
//     console.log("req.body", req.body)
//     const hashedPassword = await bcrypt.hash(password, saltRounds);




//     let referralCode;
//     do {
//       referralCode = generateReferralCode();
//     } while (await User.findOne({ referralCode }));

//     console.log("referralCode", referralCode);
//     console.log("userId", userId);
//     const newUser = new User({
//       userId: userId.toLowerCase(),
//       phone: [{
//         countryCode: countryCode,
//         number: phone,
//         isDefault: true,
//         verified: false
//       }],
//       countryCode,
//       password: hashedPassword,
//       referralCode,
//       isVerified: { phone: false },
//       isEmailVerified: false,
//       referredBy: referredBy


//     });

//     console.log("newUser", newUser);

//     await newUser.save();

    
//       const operatorcode = "rbdb";
//       const secret = "9332fd9144a3a1a8bd3ab7afac3100b0";
//       const signature = crypto
//         .createHash("md5")
//         .update(operatorcode + newUser.userId + secret)
//         .digest("hex")
//         .toUpperCase();

//       const apiUrl = `http://fetch.336699bet.com/createMember.aspx?operatorcode=${operatorcode}&username=${newUser.userId}&signature=${signature}`;

//       // const apiResponse = await axios.get(apiUrl);
//       const attemptApiCall = async () => {
//         try {
//           const apiResponse = await axios.get(apiUrl);
//           return apiResponse.data?.errMsg === "SUCCESS";
//         } catch (e) {
//           console.error('API Request Failed:', e.message);
//           return false;
//         }
//       };

// console.log("newUser", newUser)
//       let apiSuccess = await attemptApiCall()

// console.log("apiSuccess", apiSuccess)
//       if (!apiSuccess) {
//         // Retry once more
//         console.log("Retrying API call...");
//         apiSuccess = await attemptApiCall();
//       }

//       if (!apiSuccess) {
//         await User.findOneAndDelete({ userId: newUser.userId });
//         return res.status(400).json({ success: false, message: "API Verification Failed. User not created." });
//       }

//       newUser.apiVerified = true;
//       await newUser.save();





//       // if (referredBy) {


//       //   // const referrerWithAffiliate = await AffiliateUser.findOne({ referralCode: referredBy });
//       //   // const referrerWithNewuserSubadmin = await SubAdminModel.findOne({ referralCode: referredBy });

//       //   // const referrerAffiliate = await AffiliateUser.findOne({ referralCode: referrerWithAffiliate.referredBy });
//       //   // const referrersubAdminAffiliate = await User.findOne({ referralCode: referrerAffiliate. });



//       //   // if (referrerAffiliate) {
//       //   //   // Affiliate referral
//       //   //   newUser. = referrerAffiliate.referralCode;
//       //   //   referrerAffiliate.AffiliatereferralOfUser.push(newUser.userId);
//       //   //   await referrerAffiliate.save();

//       //   //   // Find parent SubAdmin
//       //   //   const parentSubAdmin = await SubAdmin.findOne({ referralCode: referrerAffiliate.referredbysubAdmin });
//       //   //   if (parentSubAdmin) {
//       //   //     newUser.referredbysubAdmin = parentSubAdmin.referralCode;
//       //   //     parentSubAdmin.users.push(newUser.userId);
//       //   //     await parentSubAdmin.save();
//       //   //   }
//       //   //   // newUser. = referrerAffiliate.referralCode,
//       //   //   //   newUser.referredbysubAdmin = referrerbysubAdmin.referralCode,

//       //   //   //   newUser.save();



//       //   // } else if (referrerWithNewuserSubadmin) {
//       //   //   // Direct SubAdmin referral
//       //   //   newUser.referredbysubAdmin = referrerWithNewuserSubadmin.referralCode;
//       //   //   const subAdmin = await SubAdmin.findOne({ referralCode: referrerWithNewuserSubadmin.referredbysubAdmin });
//       //   //   subAdmin.users.push(newUser.userId);
//       //   //   await subAdmin.save();
//       //   // } else if (referrerAffiliate) {
//       //   //   // Direct SubAdmin referral
//       //   //   newUser.e.referralCode;
//       //   //   referrerAffiliate.AffiliatereferralOfUser.push(newUser.userId);
//       //   //   await referrerAffiliate.save();
//       //   // }



//       //   const referrer = await User.findOne({  referralCode: referredBy });

//       //   if (referrer) {
//       //     referrer.levelOneReferrals.push(newUser.userId);
//       //     await referrer.save();

//       //     await new ReferralBonus({
//       //       userId: referrer.userId,
//       //       referredUser: newUser.userId,
//       //       // .referralCode || null,
//       //       // referredbysubAdmin: referrerbysubAdmin.referralCode || null,
//       //       level: 1
//       //     }).save();

//       //     if (referrer.referredBy) {
//       //       const level2Ref = await User.findOne({ referralCode: referrer.referredBy });
//       //       if (level2Ref) {
//       //         level2Ref.levelTwoReferrals.push(newUser.userId);
//       //         await level2Ref.save();

//       //         await new ReferralBonus({
//       //           userId: level2Ref.userId,
//       //           referredUser: newUser.userId,
//       //           // : referrerAffiliate.referralCode || null,
//       //           // referredbysubAdmin: referrerbysubAdmin.referralCode || null,

//       //           level: 2
//       //         }).save();

//       //         if (level2Ref.referredBy) {
//       //           const level3Ref = await User.findOne({ referralCode: level2Ref.referredBy });
//       //           if (level3Ref) {
//       //             level3Ref.levelThreeReferrals.push(newUser.userId);
//       //             await level3Ref.save();

//       //             await new ReferralBonus({
//       //               userId: level3Ref.userId,
//       //               referredUser: newUser.userId,
//       //               // : referrerAffiliate.referralCode || null,
//       //               // referredbysubAdmin: referrerbysubAdmin.referralCode || null,
//       //               level: 3
//       //             }).save();
//       //           }
//       //         }
//       //       }
//       //     }
//       //     // if (referrerAffiliate.) {
//       //     //   newUser. = referrerAffiliate.;
//       //     // }
//       //     // if (referrerWithNewuserSubadmin.referredbysubAdmin) {
//       //     //   newUser.referredbysubAdmin = referrerWithNewuserSubadmin.referredbysubAdmin;
//       //     // }
//       //     // if (referrerWithNewuserSubadmin.referredbysubAdmin && referrerWithNewuserSubadmin.referredbysubAdmin) {
//       //     //   newUser.referredbysubAdmin = referrerWithNewuserSubadmin.referredbysubAdmin;
//       //     // }
//       //   }
//       // }

//       if (referralCode) {
//       const referrer = await User.findOne({ referralCode:referredBy });
//       if (referrer) {
//         referrer.levelOneReferrals.push(newUser.userId);
//         await referrer.save();

//         await new ReferralBonus({
//           userId: referrer.userId,
//           referredUser: newUser.userId,
//           level: 1
//         }).save();

//         if (referrer.referredBy) {
//           const level2Ref = await User.findOne({ referralCode: referrer.referredBy });
//           if (level2Ref) {
//             level2Ref.levelTwoReferrals.push(newUser.userId);
//             await level2Ref.save();

//             await new ReferralBonus({
//               userId: level2Ref.userId,
//               referredUser: newUser.userId,
//               level: 2
//             }).save();

//             if (level2Ref.referredBy) {
//               const level3Ref = await User.findOne({ referralCode: level2Ref.referredBy });
//               if (level3Ref) {
//                 level3Ref.levelThreeReferrals.push(newUser.userId);
//                 await level3Ref.save();

//                 await new ReferralBonus({
//                   userId: level3Ref.userId,
//                   referredUser: newUser.userId,
//                   level: 3
//                 }).save();
//               }
//             }
//           }
//         }
//       }
//     }


//       await newUser.save();




//       const token = jwt.sign({ userId: newUser.userId }, JWT_SECRET, { expiresIn: '2d' });

//       const newUserDetails = await User.aggregate([
//         { $match: { userId } },
//         {
//           $project: {
//             userId: 1,
//             name: 1,
//             phone: 1,
//             balance: 1,
//             referredBy: 1,
//             referredLink: 1,
//             referralCode: 1,
//             timestamp: 1,
//             birthday: 1,
//             countryCode: 1,
//             isVerified: 1
//           }
//         }
//       ]);

//       res.status(201).json({
//         success: true,
//         message: 'User registered successfully',
//         token,
//         user: {
//           userId: newUser.userId,
//           phone: newUser.phone,
//           referralCode: newUser.referralCode,
//           referredBy: newUser.referredBy,
//           timestamp: newUser.timestamp,
//           isVerified: newUser.isVerified,
//           birthday: newUser.birthday,
//           isNameVerified: newUser.isNameVerified,
//           countryCode: newUser.countryCode,
//           isVerified: newUser.isVerified,
//           referredLink: newUser.referredLink,
//           // : newUser.,
//           referredbysubAdmin: newUser.referredbysubAdmin,
//           levelOneReferrals: newUser.levelOneReferrals,
//           levelTwoReferrals: newUser.levelTwoReferrals,
//           levelThreeReferrals: newUser.levelThreeReferrals


//         },
//         userDetail: newUserDetails
//       });
//     } catch (error) {
//       console.error('Registration Error:', error);
//       res.status(500).json({ success: false, message: 'Server error during registration' });
//     }
//   };



//   exports.loginUser = async (req, res) => {
//     const { userId, password } = req.body;
  
//   console.log("🔐 Login attempt received:", { 
//     userId, 
//     passwordLength: password ? password.length : 0,
//     timestamp: new Date().toISOString() 
//   });

//   try {
//     if (!userId || !password) {
//       console.log("❌ Missing credentials");
//       return res.status(400).json({ 
//         success: false,
//         message: "User ID and password are required" 
//       });
//     }

//     console.log("🔍 Searching for user with identifier:", userId);

//     // Try multiple search methods with detailed logging
//     let user = await User.findOne({ userId: userId });
//     console.log(`🔍 Search by userId '${userId}':`, user ? `FOUND - ${user.userId}` : 'NOT FOUND');

//     if (!user) {
//       user = await User.findOne({ email: userId });
//       console.log(`🔍 Search by email '${userId}':`, user ? `FOUND - ${user.email}` : 'NOT FOUND');
//     }
    
//     if (!user) {
//       user = await User.findOne({ "phone.number": userId });
//       console.log(`🔍 Search by phone '${userId}':`, user ? `FOUND - ${user.phone[0]?.number}` : 'NOT FOUND');
//     }

//     if (!user) {
//       console.log("❌ No user found with any identifier");
      
//       // Log all available users for debugging
//       const allUsers = await User.find({}).select('userId email name').limit(5);
//       console.log("📋 Available users in database:", allUsers.map(u => ({
//         userId: u.userId,
//         email: u.email,
//         name: u.name
//       })));
      
//       return res.status(404).json({ 
//         success: false,
//         message: "User not found. Please check your User ID or register first.",
//         availableUsers: allUsers.map(u => u.userId) // Show available user IDs
//       });
//     }

//     console.log("✅ User found:", user.userId);
//     console.log("🔐 Comparing password...");

//     // Check if account is locked
//     if (user.isLocked) {
//       console.log("🔒 Account is locked for user:", user.userId);
//       return res.status(423).json({
//         success: false,
//         message: "Account temporarily locked. Try again in 30 minutes."
//       });
//     }

//     // Verify password
//     const isPasswordValid = await user.comparePassword(password);
//     console.log("🔐 Password validation result:", isPasswordValid);

//     if (!isPasswordValid) {
//       console.log("❌ Invalid password for user:", user.userId);
//       await user.incrementLoginAttempts();
      
//       const attemptsLeft = 5 - user.loginAttempts;
//       return res.status(401).json({
//         success: false,
//         message: `Invalid password. ${attemptsLeft > 0 ? attemptsLeft + ' attempts left' : 'Account locked for 30 minutes'}`
//       });
//     }

//     console.log("✅ Password valid, resetting login attempts");
//     await user.resetLoginAttempts();

//     // Update login info
//     const clientIp = req.ip || req.connection.remoteAddress;
//     user.lastLoginIp = clientIp;
//     user.lastLoginTime = new Date();
//     user.onlinestatus = new Date();
//     await user.save();

//     // Generate token
//     const token = user.generateAuthToken();
//     console.log("✅ Login successful for user:", user.userId);

//     res.status(200).json({
//       success: true,
//       message: "Login successful",
//       token,
//       user: {
//         userId: user.userId,
//         name: user.name,
//         email: user.email,
//         phone: user.phone,
//         balance: user.balance,
//         referralCode: user.referralCode
//       }
//     });

//   } catch (error) {
//     console.error("💥 Login error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error during login",
//       error: error.message
//     });
//   }
// }

  exports.verify = async (req, res) => {
    const authHeader = req.header("Authorization");
    console.log("userId",authHeader);
    const token = authHeader?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token missing!" });
    try {
      const decoded = jwt.verify(token, "Kingbaji");

      const decodedId = decoded?.id;

        console.log("User profile fetched:", decodedId);
      await User.updateOne(
        { userId: decodedId },
        { $set: { onlinestatus: new Date() } }
      );



      const details = await User.findOne({ userId: decodedId }).select(
        "-password"
      )
      console.log( "decoded",details );
      res.status(200).json({ message: "User authenticated", userId: decoded.id, user: details[0] });
    } catch (error) {
      res.status(400).json({ message: "Invalid token!" });
    }
  };

exports.register = async (req, res) => {
  try {
    const { userId, phone, password, countryCode, referredBy, email, name } = req.body;
    
    console.log("📝 Registration attempt:", { userId, phone, countryCode, referredBy });

    // Validation
    if (!userId || !phone || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID, phone, and password are required" 
      });
    }

    // Check existing user
    const existingUser = await User.findOne({
      $or: [
        { userId: userId.toLowerCase() },
        { "phone.number": phone },
        ...(email ? [{ email: email.toLowerCase() }] : [])
      ]
    });

    if (existingUser) {
      return res.status(409).json({ 
        success: false,
        message: 'User already exists with this ID, phone, or email' 
      });
    }

    // Generate referral code
    let referralCode;
    do {
      referralCode = generateReferralCode();
    } while (await User.findOne({ referralCode }));

    console.log("🔐 Creating new user with referral code:", referralCode);

    // Create new user
    const newUser = new User({
      userId: userId.toLowerCase(),
      name,
      email: email ? email.toLowerCase() : undefined,
      phone: [{
        countryCode: countryCode,
        number: phone,
        isDefault: true,
        verified: false
      }],
      countryCode,
      password: password,
      referralCode,
      isVerified: { phone: false, email: false },
      referredBy: referredBy || undefined
    });

    await newUser.save();
    console.log("✅ User saved to database:", newUser.userId);

    // API Verification
    try {
      const operatorcode = "rbdb";
      const secret = "9332fd9144a3a1a8bd3ab7afac3100b0";
      const signature = crypto
        .createHash("md5")
        .update(operatorcode + newUser.userId + secret)
        .digest("hex")
        .toUpperCase();

      const apiUrl = `http://fetch.336699bet.com/createMember.aspx?operatorcode=${operatorcode}&username=${newUser.userId}&signature=${signature}`;

      const attemptApiCall = async () => {
        try {
          const apiResponse = await axios.get(apiUrl);
          return apiResponse.data?.errMsg === "SUCCESS";
        } catch (e) {
          console.error('❌ API Request Failed:', e.message);
          return false;
        }
      };

      let apiSuccess = await attemptApiCall();
      if (!apiSuccess) {
        console.log("🔄 Retrying API call...");
        apiSuccess = await attemptApiCall();
      }

      if (apiSuccess) {
        newUser.apiVerified = true;
        await newUser.save();
        console.log("✅ API verification successful");
      } else {
        await User.findByIdAndDelete(newUser._id);
        return res.status(400).json({ 
          success: false, 
          message: "API Verification Failed. User not created." 
        });
      }
    } catch (apiError) {
      console.error("❌ API verification error:", apiError);
      await User.findByIdAndDelete(newUser._id);
      return res.status(400).json({ 
        success: false, 
        message: "API Verification Failed" 
      });
    }

    // Handle referral system
    if (referredBy) {
      await handleReferralSystem(newUser, referredBy);
    }

    // Generate token
    const token = newUser.generateAuthToken();

    // Prepare response
    const userResponse = await User.aggregate([
      { $match: { userId: newUser.userId } },
      {
        $project: {
          userId: 1,
          name: 1,
          email: 1,
          phone: 1,
          balance: 1,
          referredBy: 1,
          referralCode: 1,
          timestamp: 1,
          birthday: 1,
          countryCode: 1,
          isVerified: 1,
          levelOneReferrals: 1,
          levelTwoReferrals: 1,
          levelThreeReferrals: 1,
          apiVerified: 1,
          role: 1
        }
      }
    ]);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userResponse[0]
    });

  } catch (error) {
    console.error('💥 Registration Error:', error);
    
    // Clean up if user was created but process failed
    if (req.body.userId) {
      await User.findOneAndDelete({ userId: req.body.userId.toLowerCase() });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper function for referral handling
async function handleReferralSystem(newUser, referredByCode) {
  try {
    const referrer = await User.findOne({ referralCode: referredByCode });
    if (!referrer) {
      console.log("⚠️ Referrer not found with code:", referredByCode);
      return;
    }

    // Level 1 referral
    await referrer.addReferral(newUser.userId, 1);
    await new ReferralBonus({
      userId: referrer.userId,
      referredUser: newUser.userId,
      level: 1
    }).save();

    // Level 2 referral (if referrer has a referrer)
    if (referrer.referredBy) {
      const level2Ref = await User.findOne({ referralCode: referrer.referredBy });
      if (level2Ref) {
        await level2Ref.addReferral(newUser.userId, 2);
        await new ReferralBonus({
          userId: level2Ref.userId,
          referredUser: newUser.userId,
          level: 2
        }).save();

        // Level 3 referral
        if (level2Ref.referredBy) {
          const level3Ref = await User.findOne({ referralCode: level2Ref.referredBy });
          if (level3Ref) {
            await level3Ref.addReferral(newUser.userId, 3);
            await new ReferralBonus({
              userId: level3Ref.userId,
              referredUser: newUser.userId,
              level: 3
            }).save();
          }
        }
      }
    }

    console.log("✅ Referral system processed successfully");
  } catch (error) {
    console.error("❌ Referral system error:", error);
  }
}

exports.loginUser = async (req, res) => {
  const { userId, password } = req.body;

  console.log("🔐 Login attempt received:", { 
    userId, 
    passwordLength: password ? password.length : 0,
    timestamp: new Date().toISOString() 
  });

  try {
    if (!userId || !password) {
      console.log("❌ Missing credentials");
      return res.status(400).json({ 
        success: false,
        message: "User ID and password are required" 
      });
    }

    console.log("🔍 Searching for user with identifier:", userId);

    // Search user by multiple identifiers
    let user = await User.findOne({ 
      $or: [
        { userId: userId.toLowerCase() },
        // { email: userId.toLowerCase() },
        { "phone.number": userId }
      ]
    });

    console.log(`🔍 Search result:`, user ? `FOUND - ${user.userId}` : 'NOT FOUND');

    if (!user) {
      console.log("❌ No user found with any identifier");
      
      const allUsers = await User.find({}).select('userId email phone.number').limit(5);
      console.log("📋 Available users in database:", allUsers.map(u => ({
        userId: u.userId,
        email: u.email,
        phone: u.phone?.[0]?.number || 'No phone'
      })));
      
      return res.status(404).json({ 
        success: false,
        message: "User not found. Please check your User ID or register first."
      });
    }

    console.log("✅ User found:", user.userId);

    // Check if account is locked
    if (user.isLocked) {
      console.log("🔒 Account is locked for user:", user.userId);
      return res.status(423).json({
        success: false,
        message: "Account temporarily locked. Try again in 30 minutes."
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    console.log("🔐 Password validation result:", isPasswordValid);

    if (!isPasswordValid) {
      console.log("❌ Invalid password for user:", user.userId);
      await user.incrementLoginAttempts();
      
      const attemptsLeft = 5 - user.loginAttempts;
      return res.status(401).json({
        success: false,
        message: `Invalid password. ${attemptsLeft > 0 ? attemptsLeft + ' attempts left' : 'Account locked for 30 minutes'}`
      });
    }

    console.log("✅ Password valid, resetting login attempts");
    await user.resetLoginAttempts();

    // Update login info
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    await user.updateLoginInfo(clientIp);

    // Generate tokens
    const token = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    console.log("✅ Login successful for user:", user.userId);

    // Get user details for response
    const userDetails = await User.aggregate([
      { $match: { userId: user.userId } },
      {
        $project: {
          userId: 1,
          name: 1,
          email: 1,
          phone: 1,
          balance: 1,
          referredBy: 1,
          referralCode: 1,
          timestamp: 1,
          birthday: 1,
          countryCode: 1,
          isVerified: 1,
          levelOneReferrals: 1,
          levelTwoReferrals: 1,
          levelThreeReferrals: 1,
          lastLoginTime: 1,
          lastLoginIp: 1,
          apiVerified: 1,
          role: 1,
          vipPoints: 1,
          cashReward: 1,
          totalBonus: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      refreshToken,
      user: userDetails[0]
    });

  } catch (error) {
    console.error("💥 Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required"
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET + "Kingbaji");
    const user = await User.findOne({ userId: decoded.userId });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Verify refresh token signature
    try {
      jwt.verify(refreshToken, JWT_SECRET + user.password);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token"
      });
    }

    const newToken = user.generateAuthToken();
    const newRefreshToken = user.generateRefreshToken();

    res.json({
      success: true,
      token: newToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid refresh token"
    });
  }
};

exports.logout = async (req, res) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return success
    res.json({
      success: true,
      message: "Logout successful"
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during logout"
    });
  }
};



  exports.userDetails = async (req, res) => {
    // const { userId } = req.body;
    const  userId = req.user.userId;
    // const authHeader = req.header("Authorization");
    // console.log("userId", authHeader);
    // // console.log("userId :            1", userId);
    // const token = authHeader?.split(" ")[1];
    // console.log("userId", token);
    // if (!token) return res.status(401).json({ message: "Token missing!" }); 
    try {
      // const decoded = jwt.verify(token, "Kingbaji");
      // console.log("decoded", decoded);
      // const decodedId = decoded?.userId;
      const user = await User.findOne({ userId: userId });
      console.log("user", user);
      if (!user) return res.status(404).json({ message: "User not found" });
      // console.log(user.userId )
      if (user) {
        const details = await User.aggregate([
          { $match: { userId: user.userId } },
          {
            $project: {
              userId: 1,
              name: 1,
              phone: 1,
              balance: 1,
              referredBy: 1,
              referredLink: 1,
              referralCode: 1,
              timestamp: 1,
              username: 1,
              birthday: 1,
              isVerified: 1,
              isNameVerified: 1,
              // : 1,
              referredbysubAdmin: 1,
              levelOneReferrals: 1,
              levelTwoReferrals: 1,
              levelThreeReferrals: 1
            },
          },
        ]);
        console.log( { message: "User balance", user: details[0] });
        res.status(200).json({ message: "User balance", user: details[0] });
      } else {
        res.status(200).json({ message: "User game balance is 0", user: details[0] });
      }
    } catch (error) {
      console.log("error", error);
      res.status(400).json({ message: "Invalid token!" });
    }
  };










  exports.verifyPhone = async (req, res) => {
    console.log(req.body);
    try {
      const { phone, code, userId } = req.body;

      console.log(phone, code, userId);
      const user = await User.findOne({ userId: userId });
      // const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
      console.log("1", phone, code, userId);
      const phones = user.phone.find(p => p.number === phone);
      if (!phone) return res.status(404).json({ error: 'Phone number not found' });
      console.log("2", phone, code, userId);
      if (phones.verificationCode !== code) {
        return res.status(400).json({ error: 'Invalid OTP code' });
      }

      if (new Date() > phones.verificationExpiry) {
        return res.status(400).json({ error: 'OTP has expired' });
      }

      phones.verified = true;
      phones.verificationCode = undefined;
      phones.verificationExpiry = undefined;

      await user.save();
      res.json({ success: true, message: 'Phone number verified' });
    } catch (err) {
      res.status(500).json({ error: 'Server error', details: err.message });
    }
  }

  exports.addPhoneNumber = async (req, res) => {
    try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ error: 'User not found' });

      const { number, isDefault = false } = req.body;
      const phoneRegex = /^\+\d{1,3}\d{6,14}$/;

      if (!phoneRegex.test(number)) {
        return res.status(400).json({ error: 'Invalid phone number format' });
      }

      // Check if number exists in user's account
      const exists = user.phoneNumbers.some(p => p.number === number);
      if (exists) return res.status(400).json({ error: 'Number already exists in your account' });

      const newPhone = {
        number,
        isDefault: user.phoneNumbers.length === 0 ? true : isDefault,
        isVerified: false
      };

      // If setting as default, update existing defaults
      if (newPhone.isDefault) {
        user.phoneNumbers.forEach(phone => {
          phone.isDefault = false;
        });
      }

      user.phoneNumbers.push(newPhone);

      await user.save();
      res.status(201).json({ message: 'Phone number added', phone: newPhone });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ error: 'Phone number already registered' });
      }
      res.status(500).json({ error: 'Server error', details: err.message });
    }
  };



  exports.SendPhoneVerificationCode = async (req, res) => {
    console.log(req.body)
    try {
      // Destructure required fields from request body
      const {
        userId,
        phone: {
          countryCode = '880',
          number,
          isDefault = false // Default to false if not provided
        }
      } = req.body;

      // Validate required fields
      if (!countryCode || !number) {
        return res.status(400).json({ error: 'Missing required phone fields' });
      }

      // Basic phone number validation
      // if (!/^\d{10,15}$/.test(number)) {
      //   return res.status(400).json({ error: 'Invalid phone number format' });
      // }

      // Find user with matching userId
      const user = await User.findOne({ userId });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if phone number already exists in user's phones
      const existingPhone = user.phone.find(p => p.number === number);
      if (existingPhone) {
        if (existingPhone.verified) {
          return res.status(400).json({ error: 'Phone number already verified' });
        }

        // Generate new OTP and update existing record
        const otp = GenerateOtpCode();
        existingPhone.verificationCode = otp;
        existingPhone.verificationExpiry = new Date(Date.now() + 15 * 60 * 1000);

        await user.save();

        // Send SMS with verification code
        try {

          const fullPhoneNumber = "880" + existingPhone.number;
          await sendSms(fullPhoneNumber, `From KingBaji UserId: ${user.userId} Your OTP is: ${otp}`);
          return res.json({ success: true, message: 'OTP resent successfully' });
        } catch (smsError) {
          console.error('SMS sending failed:', smsError);
          return res.status(500).json({ error: 'Failed to send SMS' });
        }
      }

      // Validate phone number limit
      if (user.phone.length >= 3) {
        return res.status(400).json({ error: 'Maximum of 3 phone numbers allowed' });
      }

      // Determine if this should be the default phone
      const isFirstPhone = user.phone.length === 0;
      const actualIsDefault = isFirstPhone ? true : isDefault;

      // Prepare new phone entry
      const newPhone = {
        countryCode,
        number,
        isDefault: actualIsDefault,
        verified: false,
        verificationCode: GenerateOtpCode(),
        verificationExpiry: new Date(Date.now() + 15 * 60 * 1000)
      };

      // Update existing default phones if needed
      if (actualIsDefault) {
        user.phone.forEach(phone => phone.isDefault = false);
      }

      // Add new phone to user's phone list
      user.phone.push(newPhone);

      try {
        await user.save();
      } catch (error) {
        // Handle duplicate phone number error
        if (error.code === 11000) {
          return res.status(400).json({ error: 'Phone number already registered' });
        }
        throw error;
      }

      // Send verification SMS
      try {
        const fullPhoneNumber = "880" + existingPhone.number;
        await sendSms(fullPhoneNumber,
          `From KingBaji UserId: ${user.userId} Your OTP is: ${newPhone.verificationCode}`
        );
        return res.json({ success: true, message: 'OTP sent successfully' });
      } catch (smsError) {
        // Rollback phone number addition if SMS fails
        user.phone = user.phone.filter(p => p.number !== number);
        await user.save();
        console.error('SMS sending failed:', smsError);
        return res.status(500).json({ error: 'Failed to send SMS' });
      }

    } catch (error) {
      console.error('Error in SendPhoneVerificationCode:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  // const nodemailer = require("nodemailer");


  const GenerateOtpCode = require('./GenerateOtpCode');
  const SubAdmin = require('../models/SubAdminModel');
  const SocialLink = require('../models/SocialLink');
  // const ReferralBonus = require('../Models/ReferralBonus');
  // const Affiliate = require('../Models/AffiliateModel');
  // const SubAdmin = require('../Models/SubAdminModel');
  // const AffiliateUser = require('../Models/AffiliateUser');



  // const transporter = nodemailer.createTransport({
  //   host: process.env.SMTP_HOST,
  //   port: parseInt(process.env.SMTP_PORT),
  //   auth: {
  //     user: process.env.SMTP_USER,
  //     pass: process.env.SMTP_PASS,
  //   },
  // });



  // exports.SendPhoneVerificationCode = async (req, res) => {
  //   console.log(req.body)
  //   try {
  //     // Destructure required fields from request body
  //     const { 
  //       userId, 
  //       phone: { 
  //         countryCode='880', 
  //         number, 
  //         isDefault = false // Default to false if not provided
  //       } 
  //     } = req.body;

  //     // Validate required fields
  //     if (!countryCode || !number) {
  //       return res.status(400).json({ error: 'Missing required phone fields' });
  //     }

  //     // Basic phone number validation
  //     // if (!/^\d{10,15}$/.test(number)) {
  //     //   return res.status(400).json({ error: 'Invalid phone number format' });
  //     // }

  //     // Find user with matching userId
  //     const user = await User.findOne({ userId });
  //     if (!user) {
  //       return res.status(404).json({ error: 'User not found' });
  //     }

  //     // Check if phone number already exists in user's phones
  //     const existingemail = user.email.find({email:email});
  //     if (existingemail) {
  //       if (existingemail.verified) {
  //         return res.status(400).json({ error: 'Phone number already verified' });
  //       }

  //       // Generate new OTP and update existing record
  //       const otp = GenerateOtpCode();
  //       existingemail.verificationCode = otp;
  //       existingemail.verificationExpiry = new Date(Date.now() + 15 * 60 * 1000);

  //       await user.save();

  //       // Send SMS with verification code
  //       try {

  //         const fullPhoneNumber = "880" + existingPhone.number;
  //         await sendSms(fullPhoneNumber, `From KingBaji UserId: ${user.userId} Your OTP is: ${otp}`);
  //         return res.json({ success: true, message: 'OTP resent successfully' });
  //       } catch (smsError) {
  //         console.error('SMS sending failed:', smsError);
  //         return res.status(500).json({ error: 'Failed to send SMS' });
  //       }
  //     }

  //     // Validate phone number limit
  //     if (user.phone.length >= 3) {
  //       return res.status(400).json({ error: 'Maximum of 3 phone numbers allowed' });
  //     }

  //     // Determine if this should be the default phone
  //     const isFirstPhone = user.phone.length === 0;
  //     const actualIsDefault = isFirstPhone ? true : isDefault;

  //     // Prepare new phone entry
  //     const newPhone = {
  //       countryCode,
  //       number,
  //       isDefault: actualIsDefault,
  //       verified: false,
  //       verificationCode: GenerateOtpCode(),
  //       verificationExpiry: new Date(Date.now() + 15 * 60 * 1000)
  //     };

  //     // Update existing default phones if needed
  //     if (actualIsDefault) {
  //       user.phone.forEach(phone => phone.isDefault = false);
  //     }

  //     // Add new phone to user's phone list
  //     user.phone.push(newPhone);

  //     try {
  //       await user.save();
  //     } catch (error) {
  //       // Handle duplicate phone number error
  //       if (error.code === 11000) {
  //         return res.status(400).json({ error: 'Phone number already registered' });
  //       }
  //       throw error;
  //     }

  //     // Send verification SMS
  //     try {
  //       const fullPhoneNumber = "880" + existingPhone.number;
  //       await sendSms(fullPhoneNumber, 
  //         `From KingBaji UserId: ${user.userId} Your OTP is: ${newPhone.verificationCode}`
  //       );
  //       return res.json({ success: true, message: 'OTP sent successfully' });
  //     } catch (smsError) {
  //       // Rollback phone number addition if SMS fails
  //       user.phone = user.phone.filter(p => p.number !== number);
  //       await user.save();
  //       console.error('SMS sending failed:', smsError);
  //       return res.status(500).json({ error: 'Failed to send SMS' });
  //     }

  //   } catch (error) {
  //     console.error('Error in SendPhoneVerificationCode:', error);
  //     return res.status(500).json({ error: 'Internal server error' });
  //   }
  // };




  // exports.verifyEmailOTP = async (req, res) => {
  //   const { email, otp } = req.body;
  //   if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });

  //   const record = await OTP.findOne({ email, otp });
  //   if (!record || record.expiresAt < new Date()) {
  //     return res.status(400).json({ message: "Invalid or expired OTP" });
  //   }

  //   let user = await User.findOne({ email });
  //   if (!user) user = await User.create({ email });

  //   user.verified.email = true;
  //   await user.save();

  //   await OTP.deleteMany({ email });

  //   return res.json({ message: "Email verified successfully", user });
  // };



  exports.updateUser = async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['fullName', 'birthday', 'email'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
      updates.forEach(update => req.user[update] = req.body[update]);
      await req.user.save();
      res.send(req.user);
    } catch (e) {
      res.status(400).send(e);
    }
  }




  exports.getUserSocialLinks = async (req, res) => {
    try {
      const { userId, referredBy } = req.body;

      console.log("getUserSocialLinks", userId, referredBy);

      // Find the user by ID
      const user = await User.findOne({ userId: userId });
      console.log(user);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if the user was referred by a SubAdmin


      // Find the SubAdmin using the referral code
      const subAdmin = await SubAdmin.findOne({ referralCode: user.referredBy });
      console.log("subAdmin", subAdmin);
      if (!subAdmin) {
        return res.status(404).json({ message: 'Referring SubAdmin not found' });
      }

      // Retrieve the social links for the SubAdmin
      const socialLinks = await SocialLink.findOne({
        referredBy: subAdmin.referralCode,
      });
      console.log("socialLinks", socialLinks);
      res.status(200).json({ socialLinks: socialLinks || {} });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };







  // Controller function to get referred users
exports.getReferredUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const [todayRebate, yesterdayRebate] = await Promise.all([
      ReferralBonus.aggregate([
        { $match: { 
          userId: user.userId,
          earnedAt: { $gte: new Date().setHours(0,0,0,0) }
        }},
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      ReferralBonus.aggregate([
        { $match: { 
          userId: user.userId,
          earnedAt: { 
            $gte: new Date(Date.now() - 86400000).setHours(0,0,0,0),
            $lt: new Date().setHours(0,0,0,0)
          }
        }},
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        friendsInvited: user.levelOneReferrals.length,
        friendsCompleted: await ReferralBonus.countDocuments({
          userId: user.userId,
          turnover: { $gte: 5000 } // Minimum turnover requirement
        }),
        todayRebate: todayRebate[0]?.total || 0,
        yesterdayRebate: yesterdayRebate[0]?.total || 0,
        claimableBonus: await ReferralBonus.aggregate([
          { $match: { userId: user.userId, isClaimed: false } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ])
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}





// Get referral statistics
exports.getReferralStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const [levelOne, levelTwo, levelThree] = await Promise.all([
      User.find({ referredBy: userId }),
      User.find({ referredBy: { $in: req.user.levelOneReferrals } }),
      User.find({ referredBy: { $in: req.user.levelTwoReferrals } })
    ]);

    const referralBonuses = await ReferralBonus.find({ userId })
      .sort({ earnedAt: -1 })
      .limit(10);

    res.send({
      levelOne: levelOne.length,
      levelTwo: levelTwo.length,
      levelThree: levelThree.length,
      referralBonuses
    });
  } catch (error) {
    res.status(500).send({ error: 'Internal server error' });
  }
};






exports.resetAndUpdatePassword = async (req, res) => {
  const { currentPassword, newPassword,userId } = req.body;
  // const token = req.headers.authorization?.split(' ')[1];
console.log(req.body)
  // if (!token) {
  //   return res.status(401).json({ 
  //     success: false,
  //     message: 'Authorization token missing' 
  //   });
  // }

  try {
    // Verify token
    // const decoded = jwt.verify(token, 'Kingbaji');
    // const userId = decoded.id;

    // Find user
    const user = await User.findOne({ userId:userId });
    console.log(user, currentPassword);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    console.log(isMatch);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
console.log(user.userId, newPassword);
    // Validate new password
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$%¨!%*#])[A-Za-z\d@$%¨!%*#]{6,20}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'New password does not meet requirements'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    

    // Update password
    user.password = hashedPassword;
    await user.save();
console.log(user.userId, hashedPassword);
    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Password update error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during password update'
    });
  }
}
