const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const axios = require("axios");
const crypto = require("crypto");
const User = require('../Models/User');
const AffiliateUser = require('../Models/AffiliateUser');
const SubAdminModel = require('../Models/SubAdminModel');
const ReferralBonus = require('../Models/ReferralBonus');
const { OTP } = require('../Models/Opt');
const { sendSms } = require('../Services/sendSms');


const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET || "Kingbaji";

exports.register = async (req, res) => {
  try {
    const { userId, phone, password, countryCode, referredBy } = req.body;
    console.log(req.body)
    if (!userId || !phone || !password) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const existingUser = await User.findOne({ userId, 'phone.number': phone });
    console.log(existingUser)
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }
    console.log("req.body", req.body)
    const hashedPassword = await bcrypt.hash(password, saltRounds);




    let referralCode;
    do {
      referralCode = generateReferralCode();
    } while (await User.findOne({ referralCode }));

    console.log("referralCode", referralCode);
    console.log("userId", userId);
    const newUser = new User({
      userId: userId.toLowerCase(),
      phone: [{
        countryCode: countryCode,
        number: phone,
        isDefault: true,
        verified: false
      }],
      countryCode,
      password: hashedPassword,
      referralCode,
      isVerified: { phone: false },
      isEmailVerified: false,
      referredBy: referredBy


    });

    console.log("newUser", newUser);

    await newUser.save();

    
      const operatorcode = "rbdb";
      const secret = "9332fd9144a3a1a8bd3ab7afac3100b0";
      const signature = crypto
        .createHash("md5")
        .update(operatorcode + newUser.userId + secret)
        .digest("hex")
        .toUpperCase();

      const apiUrl = `http://fetch.336699bet.com/createMember.aspx?operatorcode=${operatorcode}&username=${newUser.userId}&signature=${signature}`;

      // const apiResponse = await axios.get(apiUrl);
      const attemptApiCall = async () => {
        try {
          const apiResponse = await axios.get(apiUrl);
          return apiResponse.data?.errMsg === "SUCCESS";
        } catch (e) {
          console.error('API Request Failed:', e.message);
          return false;
        }
      };

console.log("newUser", newUser)
      let apiSuccess = await attemptApiCall()

console.log("apiSuccess", apiSuccess)
      if (!apiSuccess) {
        // Retry once more
        console.log("Retrying API call...");
        apiSuccess = await attemptApiCall();
      }

      if (!apiSuccess) {
        await User.findOneAndDelete({ userId: newUser.userId });
        return res.status(400).json({ success: false, message: "API Verification Failed. User not created." });
      }

      newUser.apiVerified = true;
      await newUser.save();





      // if (referredBy) {


      //   // const referrerWithAffiliate = await AffiliateUser.findOne({ referralCode: referredBy });
      //   // const referrerWithNewuserSubadmin = await SubAdminModel.findOne({ referralCode: referredBy });

      //   // const referrerAffiliate = await AffiliateUser.findOne({ referralCode: referrerWithAffiliate.referredBy });
      //   // const referrersubAdminAffiliate = await User.findOne({ referralCode: referrerAffiliate.referredbyAffiliate });



      //   // if (referrerAffiliate) {
      //   //   // Affiliate referral
      //   //   newUser.referredbyAffiliate = referrerAffiliate.referralCode;
      //   //   referrerAffiliate.AffiliatereferralOfUser.push(newUser.userId);
      //   //   await referrerAffiliate.save();

      //   //   // Find parent SubAdmin
      //   //   const parentSubAdmin = await SubAdmin.findOne({ referralCode: referrerAffiliate.referredbysubAdmin });
      //   //   if (parentSubAdmin) {
      //   //     newUser.referredbysubAdmin = parentSubAdmin.referralCode;
      //   //     parentSubAdmin.users.push(newUser.userId);
      //   //     await parentSubAdmin.save();
      //   //   }
      //   //   // newUser.referredbyAffiliate = referrerAffiliate.referralCode,
      //   //   //   newUser.referredbysubAdmin = referrerbysubAdmin.referralCode,

      //   //   //   newUser.save();



      //   // } else if (referrerWithNewuserSubadmin) {
      //   //   // Direct SubAdmin referral
      //   //   newUser.referredbysubAdmin = referrerWithNewuserSubadmin.referralCode;
      //   //   const subAdmin = await SubAdmin.findOne({ referralCode: referrerWithNewuserSubadmin.referredbysubAdmin });
      //   //   subAdmin.users.push(newUser.userId);
      //   //   await subAdmin.save();
      //   // } else if (referrerAffiliate) {
      //   //   // Direct SubAdmin referral
      //   //   newUser.referredbyAffiliate = referrerAffiliate.referralCode;
      //   //   referrerAffiliate.AffiliatereferralOfUser.push(newUser.userId);
      //   //   await referrerAffiliate.save();
      //   // }



      //   const referrer = await User.findOne({  referralCode: referredBy });

      //   if (referrer) {
      //     referrer.levelOneReferrals.push(newUser.userId);
      //     await referrer.save();

      //     await new ReferralBonus({
      //       userId: referrer.userId,
      //       referredUser: newUser.userId,
      //       // referredbyAffiliate: referrerAffiliate.referralCode || null,
      //       // referredbysubAdmin: referrerbysubAdmin.referralCode || null,
      //       level: 1
      //     }).save();

      //     if (referrer.referredBy) {
      //       const level2Ref = await User.findOne({ referralCode: referrer.referredBy });
      //       if (level2Ref) {
      //         level2Ref.levelTwoReferrals.push(newUser.userId);
      //         await level2Ref.save();

      //         await new ReferralBonus({
      //           userId: level2Ref.userId,
      //           referredUser: newUser.userId,
      //           // referredbyAffiliate: referrerAffiliate.referralCode || null,
      //           // referredbysubAdmin: referrerbysubAdmin.referralCode || null,

      //           level: 2
      //         }).save();

      //         if (level2Ref.referredBy) {
      //           const level3Ref = await User.findOne({ referralCode: level2Ref.referredBy });
      //           if (level3Ref) {
      //             level3Ref.levelThreeReferrals.push(newUser.userId);
      //             await level3Ref.save();

      //             await new ReferralBonus({
      //               userId: level3Ref.userId,
      //               referredUser: newUser.userId,
      //               // referredbyAffiliate: referrerAffiliate.referralCode || null,
      //               // referredbysubAdmin: referrerbysubAdmin.referralCode || null,
      //               level: 3
      //             }).save();
      //           }
      //         }
      //       }
      //     }
      //     // if (referrerAffiliate.referredbyAffiliate) {
      //     //   newUser.referredbyAffiliate = referrerAffiliate.referredbyAffiliate;
      //     // }
      //     // if (referrerWithNewuserSubadmin.referredbysubAdmin) {
      //     //   newUser.referredbysubAdmin = referrerWithNewuserSubadmin.referredbysubAdmin;
      //     // }
      //     // if (referrerWithNewuserSubadmin.referredbysubAdmin && referrerWithNewuserSubadmin.referredbysubAdmin) {
      //     //   newUser.referredbysubAdmin = referrerWithNewuserSubadmin.referredbysubAdmin;
      //     // }
      //   }
      // }

      if (referralCode) {
      const referrer = await User.findOne({ referralCode:referredBy });
      if (referrer) {
        referrer.levelOneReferrals.push(newUser.userId);
        await referrer.save();

        await new ReferralBonus({
          userId: referrer.userId,
          referredUser: newUser.userId,
          level: 1
        }).save();

        if (referrer.referredBy) {
          const level2Ref = await User.findOne({ referralCode: referrer.referredBy });
          if (level2Ref) {
            level2Ref.levelTwoReferrals.push(newUser.userId);
            await level2Ref.save();

            await new ReferralBonus({
              userId: level2Ref.userId,
              referredUser: newUser.userId,
              level: 2
            }).save();

            if (level2Ref.referredBy) {
              const level3Ref = await User.findOne({ referralCode: level2Ref.referredBy });
              if (level3Ref) {
                level3Ref.levelThreeReferrals.push(newUser.userId);
                await level3Ref.save();

                await new ReferralBonus({
                  userId: level3Ref.userId,
                  referredUser: newUser.userId,
                  level: 3
                }).save();
              }
            }
          }
        }
      }
    }


      await newUser.save();




      const token = jwt.sign({ id: newUser.userId }, "Kingbaji", { expiresIn: '2d' });

      const newUserDetails = await User.aggregate([
        { $match: { userId } },
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
            birthday: 1,
            countryCode: 1,
            isVerified: 1
          }
        }
      ]);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          userId: newUser.userId,
          phone: newUser.phone,
          referralCode: newUser.referralCode,
          referredBy: newUser.referredBy,
          timestamp: newUser.timestamp,
          isVerified: newUser.isVerified,
          birthday: newUser.birthday,
          isNameVerified: newUser.isNameVerified,
          countryCode: newUser.countryCode,
          isVerified: newUser.isVerified,
          referredLink: newUser.referredLink,
          referredbyAffiliate: newUser.referredbyAffiliate,
          referredbysubAdmin: newUser.referredbysubAdmin,
          levelOneReferrals: newUser.levelOneReferrals,
          levelTwoReferrals: newUser.levelTwoReferrals,
          levelThreeReferrals: newUser.levelThreeReferrals


        },
        userDetail: newUserDetails
      });
    } catch (error) {
      console.error('Registration Error:', error);
      res.status(500).json({ success: false, message: 'Server error during registration' });
    }
  };



  exports.loginUser = async (req, res) => {
    const { userId, password } = req.body;
    console.log(req.body);
    try {
      if (!userId) {
        return res.status(400).json({ message: "User Not Found, Please Login Or Sign Up" });
      }

      const user = await User.findOne({ userId });
          console.log(req.body);
      if (!user) return res.status(404).json({ message: "User not found" });

      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log(isPasswordValid);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid password" });
      }

      const response = await User.aggregate([
        { $match: { userId } },
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
            birthday: 1,
            username: 1,
            countryCode: 1,
            isVerified: 1,
            isNameVerified: 1,
            referredbyAffiliate: 1,
            referredbysubAdmin: 1,
            levelOneReferrals: 1,
            levelTwoReferrals: 1,
            levelThreeReferrals: 1
          }
        }
      ]);

      const token = jwt.sign({ id: user.userId }, "Kingbaji", { expiresIn: "2d" });

      res.status(200).json({ token, user, response });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  };

  exports.verify = async (req, res) => {
    const authHeader = req.header("Authorization");
    // console.log("userId",authHeader);
    const token = authHeader?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token missing!" });
    try {
      const decoded = jwt.verify(token, "Kingbaji");

      const decodedId = decoded?.id;
      await User.updateOne(
        { userId: decodedId },
        { $set: { onlinestatus: new Date() } }
      );



      const details = await User.aggregate([
        { $match: { userId: decodedId } },
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
            birthday: 1,
            levelOneReferrals: 1,
            levelTwoReferrals: 1,
            levelThreeReferrals: 1,
            countryCode: 1,
            isVerified: 1,
            isNameVerified: 1
          }
        },

      ]);
      // console.log( "decoded",details );
      res.status(200).json({ message: "User authenticated", userId: decoded.id, user: details[0] });
    } catch (error) {
      res.status(400).json({ message: "Invalid token!" });
    }
  };




  exports.userDetails = async (req, res) => {
    const { userId } = req.body;
    // const authHeader = req.header("Authorization");
    // console.log("userId", req.body.userId);
    // console.log("userId :            1", userId);
    // const token = authHeader?.split(" ")[1];
    // if (!token) return res.status(401).json({ message: "Token missing!" }); 
    try {
      // const decoded = jwt.verify(token, "Kingbaji");
      // console.log(userId)
      // const decodedId = decoded?.id;
      const user = await User.findOne({ userId });
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
              referredbyAffiliate: 1,
              referredbysubAdmin: 1,
              levelOneReferrals: 1,
              levelTwoReferrals: 1,
              levelThreeReferrals: 1
            },
          },
        ]);
        // console.log( "decoded",details );
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

  const generateReferralCode = require('./generateReferralCode');
  const GenerateOtpCode = require('./GenerateOtpCode');
  const SubAdmin = require('../Models/SubAdminModel');
  const SocialLink = require('../Models/SocialLink');
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
