const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

const crypto = require("crypto");
const SubAdmin = require("../Models/SubAdminModel");
const User = require('../Models/User');
const SocialLink = require('../Models/SocialLink');
const PaymentGateWayTable = require('../Models/PaymentGateWayTable');
const WidthralPaymentGateWayTable = require('../Models/WidthralPaymentGateWayTable');

// const User = require("../Models/User");


const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET || "Kingbaji";

// exports.registerSubAdmin = async (req, res) => {
//   try {
//     const { email, phone, password, countryCode, referredBy } = req.body;
//     console.log(req.body);
//     if (!email || !password) {
//       return res.status(400).json({ success: false, message: "Please enter all fields" });
//     }


//     // Check if user already exists
//     const existingUser = await SubAdmin.findOne({ email:email.toLowerCase() });
//     if (existingUser) {
//       return res.status(400).json({ success: false, message: "User already exists" });
//     }

//     const existingPhone = await SubAdmin.findOne({ phone });
// if (existingPhone) {
//   return res.status(400).json({ success: false, message: "Phone already registered" });
// }


//     // Generate required IDs
//     const SubAdminId = Math.random().toString(36).substring(2, 11);
//     const hashedPassword = await bcrypt.hash(password, saltRounds);
//     const referredCode = Math.random().toString(36).substring(2, 8);


//     const baseUrl = "https://kingbaji.live/?ref=";
//     const agentbaseUrl = "http://coag.kingbaji.live/?ref=";
//     const affiliatebaseUrl = "http://co.kingbaji.live/?ref=";
//     const user_referredLink = baseUrl + referredCode;
//     const agent_referred_Link = agentbaseUrl + referredCode;
//     const affiliate_referredsLink = affiliatebaseUrl + referredCode;
//     if (!referredCode) {
//       return res.status(500).json({ success: false, message: "Failed to generate referral code" });
//     }

//     console.log("SubAdminId", SubAdminId);
//     console.log("hashedPassword", hashedPassword);
//     console.log("referredCode", referredCode);
//     // Create new SubAdmin
//     const newUser = await new SubAdmin({
//       email,
//       phone,
//       countryCode,
//       referredBy,
//       referralCode: referredCode,
//       userId:referredCode,
//       password: hashedPassword,
//       balance: 0,
//       SubAdminId: SubAdminId,
//       isActive: true,
//       user_referredLink,
//       agent_referredLink: agent_referred_Link,
//       affiliate_referredLink: affiliate_referredsLink,
//     });

//     await newUser.save();
//     console.log("newUser", newUser);
//     // Fetch user details using aggregation
//     const response = await SubAdmin.aggregate([
//       { $match: { email: newUser.email.toLowerCase() } },
//       {
//         $project: {
//           email: 1,
//           phone: 1,
//           countryCode: 1,
//           balance: 1,
//           referredBy: 1,
//           user_referredLink: 1,
//           // agent_referredLink: 1,
//           // affiliate_referredLink: 1,
//           referralCode: 1,
//           user_role: 1,
//         },
//       },
//     ]);


//     const defaultGateways = [
//         {
//             gateway_name: "Bkash",
//             image_url: "https://i.ibb.co/0RtD1j9C/bkash.png",
//             is_active: true,
//             payment_type: "Cashout",
//             gateway_Number: "01700000000"
//         },
//         {
//             gateway_name: "Nagad",
//             image_url: "https://i.ibb.co/2YqVLj1C/nagad-1.png",
//             is_active: true,
//             payment_type: "Cashout",
//             gateway_Number: "01700000000"
//         },
//         {
//             gateway_name: "Rocket",
//             image_url: "https://i.ibb.co/Rp5QFcm9/rocket.png",
//             is_active: true,
//             payment_type: "Cashout",
//             gateway_Number: "01700000000"
//         },
//         {
//             gateway_name: "Upay",
//             image_url: "https://i.ibb.co/5WX9H0Tw/upay.png",
//             is_active: true,
//             payment_type: "Cashout",
//             gateway_Number: "01700000000"
//         },
        
//     ];


   
//            for (const gateway of defaultGateways) {
   
//                    await PaymentGateWayTable.create({
//                        user_role: response[0].user_role,
//                        email:response[0].email,
//                        gateway_name: gateway.gateway_name,
//                        gateway_Number: gateway.gateway_Number || null,
//                        payment_type: gateway.payment_type || null,
//                        image_url: gateway.image_url,
//                        referredBy: response[0].referralCode,
//                        start_time: gateway.start_time || null,
//                        end_time: gateway.end_time || null,
//                        minimum_amount: gateway.minimum_amount || 0,
//                        maximum_amount: gateway.maximum_amount || 0,
//                        is_active: true,
//                        timestamp: new Date(),
//                        updatetime: new Date()
//                    });
               
//            }



//              for (const gateway of defaultGateways) {
            
//                 await WidthralPaymentGateWayTable.create({
//                       user_role: response[0].user_role,
//                        email:response[0].email,
//                     gateway_name: gateway.gateway_name,
//                     gateway_Number: gateway.gateway_Number || null,
//                     payment_type: gateway.payment_type || null,
//                     image_url: gateway.image_url,
//                      referredBy: response[0].referralCode,
//                     start_time: gateway.start_time || null,
//                     end_time: gateway.end_time || null,
//                     minimum_amount: gateway.minimum_amount || 0,
//                     maximum_amount: gateway.maximum_amount || 0,
//                     is_active: true,
//                     timestamp: new Date(),
//                     updatetime: new Date()
//                 });
            
//         }



    
//     console.log("userRespons", response);
//     if (!response) {
//       return res.status(500).json({ success: false, message: "Failed to retrieve user details" });
//     }

//     // Generate JWT token
//     const userDetails = response[0];
//     console.log("userDetails", userDetails);
//     const token = jwt.sign({ email: userDetails.email, user_role: userDetails.user_role }, JWT_SECRET, { expiresIn: "30d" });

//     res.status(201).json({
//       success: true,
//       token,
//       userDetails,
//     });
//   } catch (error) {
//     console.error("❌ Error in register function:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };




///////////////////////////////////////////    login   //////////////////////////////////////////////////






exports.registerSubAdmin = async (req, res) => {
  try {
    const { email, phone, password, countryCode, referredBy } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please enter all required fields" });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase();

    // Check if user already exists
    const existingUser = await SubAdmin.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Optionally: check for existing phone
    // const existingPhone = await SubAdmin.findOne({ phone });
    // if (existingPhone) {
    //   return res.status(400).json({ success: false, message: "Phone already registered" });
    // }

    // Generate unique referral code
    let referredCode;
    let codeExists = true;

    while (codeExists) {
      referredCode = Math.random().toString(36).substring(2, 8);
      codeExists = await SubAdmin.findOne({ referralCode: referredCode });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate user & referral IDs
    const SubAdminId = Math.random().toString(36).substring(2, 11);
    const baseUrl = "https://kingbaji.live/?ref=";
    const agentbaseUrl = "http://coag.kingbaji.live/?ref=";
    const affiliatebaseUrl = "http://co.kingbaji.live/?ref=";

    const user_referredLink = baseUrl + referredCode;
    const agent_referred_Link = agentbaseUrl + referredCode;
    const affiliate_referredsLink = affiliatebaseUrl + referredCode;

    // Create new SubAdmin
    const newUser = new SubAdmin({
      email: normalizedEmail,
      phone,
      countryCode,
      referredBy,
      referralCode: referredCode,
      userId: referredCode,
      password: hashedPassword,
      balance: 0,
      SubAdminId,
      isActive: true,
      user_referredLink,
      agent_referredLink: agent_referred_Link,
      affiliate_referredLink: affiliate_referredsLink,
    });

    await newUser.save();

    // Fetch user details via aggregation
    const response = await SubAdmin.aggregate([
      { $match: { email: normalizedEmail } },
      {
        $project: {
          email: 1,
          phone: 1,
          countryCode: 1,
          balance: 1,
          referredBy: 1,
          user_referredLink: 1,
          referralCode: 1,
          user_role: 1,
        },
      },
    ]);

    if (!response || response.length === 0) {
      return res.status(500).json({ success: false, message: "User not found after creation" });
    }

    const userDetails = response[0];

    const defaultGateways = [
      {
        gateway_name: "Bkash",
        image_url: "https://i.ibb.co/0RtD1j9C/bkash.png",
        payment_type: "Cashout",
        gateway_Number: "01700000000",
      },
      {
        gateway_name: "Nagad",
        image_url: "https://i.ibb.co/2YqVLj1C/nagad-1.png",
        payment_type: "Cashout",
        gateway_Number: "01700000000",
      },
      {
        gateway_name: "Rocket",
        image_url: "https://i.ibb.co/Rp5QFcm9/rocket.png",
        payment_type: "Cashout",
        gateway_Number: "01700000000",
      },
      {
        gateway_name: "Upay",
        image_url: "https://i.ibb.co/5WX9H0Tw/upay.png",
        payment_type: "Cashout",
        gateway_Number: "01700000000",
      },
    ];

    const timestamp = new Date();

    // Create entries for both payment gateway tables
    const gatewayPayload = defaultGateways.map((gateway) => ({
      user_role: userDetails.user_role,
      email: userDetails.email,
      gateway_name: gateway.gateway_name,
      gateway_Number: gateway.gateway_Number,
      payment_type: gateway.payment_type,
      image_url: gateway.image_url,
      referredBy: userDetails.referralCode,
      start_time: null,
      end_time: null,
      minimum_amount: 0,
      maximum_amount: 0,
      is_active: true,
      timestamp,
      updatetime: timestamp,
    }));

    await Promise.all([
      PaymentGateWayTable.insertMany(gatewayPayload),
      WidthralPaymentGateWayTable.insertMany(gatewayPayload),
    ]);

    // Generate JWT Token
    const token = jwt.sign(
      { email: userDetails.email, user_role: userDetails.user_role },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res.status(201).json({
      success: true,
      token,
      userDetails,
    });
  } catch (error) {
    console.error("❌ Error in registerSubAdmin:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};




exports.loginSubAdmin = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);

  try {

    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await SubAdmin.findOne({ email: email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("isPasswordValid", isPasswordValid);
    if (!isPasswordValid) return res.status(401).json({ message: "Invalid password" });



    const response = await SubAdmin.aggregate([
      { $match: { email: user.email } },
      {
        $project: {
          email: 1,
          name: 1,
          phone: 1,
          countryCode: 1,
          balance: 1,
          referralCode: 1,
          referralByCode: 1,
          referredLink: 1,
          user_referredLink: 1,
          agent_referredLink: 1,
          affiliate_referredLink: 1,
          referralCode: 1,
          user_role: 1,
          _id: 0
        },
      },
    ]);

    if (!response.length) return res.status(500).json({ message: "Error fetching user data" });

    const userDetails = response[0];

    const token = jwt.sign({ email: userDetails.email, user_role: userDetails.user_role }, JWT_SECRET, { expiresIn: "30d" });


    res.status(201).json({
      success: true,

      token,
      userDetails
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};



///////////////////////////////////////////////////////////    verify   //////////////////////////////////////////////////

exports.verifySubAdmin = async (req, res) => {
  try {

    console.log(req.body);
    const authHeader = req.header("Authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Token missing!" });

    const decoded = jwt.verify(token, JWT_SECRET);
    // console.log("Decoded Token:", decoded);

    const decodedEmail = decoded?.email;
    const decodedRole = decoded?.user_role; // Fix role field
    // console.log("decodedEmail", decodedEmail);
    if (!decodedEmail || !decodedRole) {
      return res.status(400).json({ message: "Invalid token payload!" });
    }
    const newSubAdmin = await SubAdmin.findOne({ email: decodedEmail });

    const activeThreshold = new Date(Date.now() - 3 * 60 * 1000);

    const onlineUsers = await User.find({
      onlinestatus: { $gte: activeThreshold }, referredBy: newSubAdmin.referralCode
    }).select('userId name onlinestatus');
    const totalonlineUsers = await User.find({
      onlinestatus: { $gte: activeThreshold }, referredBy: newSubAdmin.referralCode
    }).countDocuments();


   


    const response = await SubAdmin.aggregate([
      { $match: { email: decodedEmail, user_role: decodedRole } },
      {
        $project: {
          email: 1,
          name: 1,
          phone: 1,
          countryCode: 1,
          balance: 1,
          referralCode: 1,
          referralByCode: 1,
          referredLink: 1,
          user_referredLink: 1,
          agent_referredLink: 1,
          // affiliate_referredLink: 1,
          referralCode: 1,
          user_role: 1,
          isActive: 1,
        },
      },
    ]);

    const userDetails = response[0];

    if (userDetails.length === 0) return res.status(404).json({ message: "User not found" });
 const totalUsers = await User.countDocuments({
      referredBy: userDetails.referralCode
    });

//     console.log("totalUsersrefferedBy", totalUsers);
// console.log("refferedBy", newSubAdmin.referralCode);


    res.status(200).json({
      success: true,
      token,
      userDetails,
      totalonlineUsers,
      totalUsers
    });

  } catch (error) {

    res.status(400).json({ message: "Invalid token!" });
  }
};




//////////////////////////////////////////// SubAdmin-withdrawal   //////////////////////////////////////////////////



exports.SubAdminUserDetails = async (req, res) => {
  const { email } = req.body;
  console.log(email)
  // const authHeader = req.header("Authorization");
  // console.log("userId", req.body.userId);
  // console.log("userId :            1", userId);
  // const token = authHeader?.split(" ")[1];
  // if (!token) return res.status(401).json({ message: "Token missing!" }); 
  try {
    // const decoded = jwt.verify(token, "Kingbaji");

    // const decodedId = decoded?.id;
    const user = await SubAdmin.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });


    const details = await SubAdmin.aggregate([
      { $match: { email: user.email } },
      {
        $project: {
          name: 1,
          email: 1,
          phone: 1,
          balance: 1,
          SubAdminId: 1,
          IsActive: 1,
          user_referredLink: 1,
          affiliate_referredLink: 1,
          referralCode: 1,
          timestamp: 1,
        },
      },
    ]);
    // console.log("decoded", details[0]);
    res.status(200).json({ message: "User ", user: details[0] });

  } catch (error) {
    console.log("error", error);
    res.status(400).json({ message: "Invalid token!" });
  }
};


/////////////////////////////////////////// Forgot Password ///////////////////////////////////////////////
// exports.forgotPassword = async (req, res) => {
//   const { email } = req.body;

//   try {
//     const user = await SubAdmin.findOne({ email: email.toLowerCase() });

//     // Always return success to prevent email enumeration
//     if (!user) {
//       return res.status(200).json({
//         success: true,
//         message: "If this email exists, we'll send a password reset link",
//       });
//     }

//     // Generate reset token with 1 hour expiration
//     const resetToken = jwt.sign(
//       { email: user.email, type: "password_reset" },
//       JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     // In production: Send email with reset link containing the token
//     // Example: sendEmail(user.email, resetToken);

//     res.status(200).json({
//       success: true,
//       message: "Password reset token generated",
//       resetToken, // Remove this in production and actually send via email
//     });
//   } catch (error) {
//     console.error("Forgot password error:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// /////////////////////////////////////////// Reset Password ///////////////////////////////////////////////
// exports.resetPassword = async (req, res) => {
//   const { token, newPassword } = req.body;

//   try {
//     // Verify token
//     const decoded = jwt.verify(token, JWT_SECRET);

//     if (decoded.type !== "password_reset") { // Fix typo here: should be "password_reset"
//       return res.status(400).json({ success: false, message: "Invalid token type" });
//     }

//     const user = await SubAdmin.findOne({ email: decoded.email });
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     // Hash new password
//     const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
//     user.password = hashedPassword;
//     await user.save();

//     res.status(200).json({
//       success: true,
//       message: "Password reset successfully",
//     });
//   } catch (error) {
//     if (error.name === "TokenExpiredError") {
//       return res.status(401).json({ success: false, message: "Reset token expired" });
//     }
//     if (error.name === "JsonWebTokenError") {
//       return res.status(401).json({ success: false, message: "Invalid token" });
//     }
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// /////////////////////////////////////////// Update Password //////////////////////////////////////////////
// exports.updatePassword = async (req, res) => {
//   const { currentPassword, newPassword } = req.body;

//   try {
//     // Get user from auth token
//     const token = req.header("Authorization")?.split(" ")[1];
//     const decoded = jwt.verify(token, JWT_SECRET);
//     const user = await SubAdmin.findOne({ email: decoded.email });

//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     // Verify current password
//     const isMatch = await bcrypt.compare(currentPassword, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ success: false, message: "Current password is incorrect" });
//     }

//     // Update to new password
//     const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
//     user.password = hashedPassword;
//     await user.save();

//     res.status(200).json({
//       success: true,
//       message: "Password updated successfully",
//     });
//   } catch (error) {
//     console.error("Update password error:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };



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




exports.getSocialLinks = async (req, res) => {
  try {
    const {userEmail,referralCode } = req.body;
    console.log("social",req.body);
    const newSubAdmin = await SubAdmin.findOne({ referralCode,email:userEmail });
    if (!newSubAdmin) return res.send({});
console.log(newSubAdmin);
    const socialLinks = await SocialLink.findOne({ referredBy: newSubAdmin.referralCode, email: newSubAdmin.email });
    console.log(socialLinks);
    res.send(socialLinks || {});
  } catch (error) {
    res.status(500).send('Server error');
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

