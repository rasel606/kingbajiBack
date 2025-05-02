const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const axios = require("axios");
const crypto = require("crypto");
const User = require('../Models/User');



const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET || "Kingbaji";

exports.register = async (req, res) => {
  try {
    const {referredBy} = req.params
    console.log(referredBy)
    const { userId, phone, password, countryCode } = req.body;

    if (!userId || !phone || !password || !countryCode) {
      return res.status(400).json({ success: false, message: "Please enter all fields" });
    }
    const existingUser = await User.findOne({ $or: [{ userId }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email or phone' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    // const referredCode = Math.random().toString(36).substring(2, 8);

    // ✅ Step 1: Create User Immediately
   



     // ✅ Step 3: Call External API Asynchronously
   
     const operatorcode = "rbdb";
     const secret = "9332fd9144a3a1a8bd3ab7afac3100b0";
     
     const newUserCreate = userId.toLowerCase();
     const signature = crypto.createHash("md5").update(operatorcode + newUserCreate + secret).digest("hex").toUpperCase();
 
     const apiUrl = `http://fetch.336699bet.com/createMember.aspx?operatorcode=${operatorcode}&username=${newUserCreate}&signature=${signature}`;
     
    // ✅ Step 2: Generate JWT Token (Send Response Immediately)


   

   

    try {
      const apiResponse = await axios.get(apiUrl);
      

      console.log("API Response Data:", apiResponse);

      // ✅ Step 4: If API response is successful, update user in DB
      if (apiResponse.data && apiResponse.data.errMsg === "SUCCESS" ) {
        await User.updateOne({ userId }, { $set: { apiVerified: true } });

        let referralCode;
        let isUnique = false;
        while (!isUnique) {
          referralCode = generateReferralCode();
          const existingCode = await User.findOne({ referralCode });
          if (!existingCode) isUnique = true;
        }
    
        // Create new user
        const newUser = new User({
          userId,
          email,
          phone,
          countryCode,
          password: hashedPassword,
          referralCode
        });
    
        // Handle referral if exists
        if (referredBy) {
          const referrer = await User.findOne({ referralCode: referredBy });
          if (referrer) {
            newUser.referredBy = referredBy;
            
            // Add to referrer's level 1 referrals
            referrer.levelOneReferrals.push(newUser._id);
            await referrer.save();
            
            // Create level 1 bonus record
            const level1Bonus = new ReferralBonus({
              user: referrer._id,
              referredUser: newUser.userId,
              level: 1,
              amount: 0 // Will be calculated later based on turnover
            });
            await level1Bonus.save();
    
            // Check for level 2 referrer
            if (referrer.referredBy) {
              const level2Referrer = await User.findOne({ referralCode: referrer.referredBy });
              if (level2Referrer) {
                level2Referrer.levelTwoReferrals.push(newUser.userId);
                await level2Referrer.save();
                
                // Create level 2 bonus record
                const level2Bonus = new ReferralBonus({
                  user: level2Referrer.userId,
                  referredUser: newUser.userId,
                  level: 2,
                  amount: 0
                });
                await level2Bonus.save();
    
                // Check for level 3 referrer
                if (level2Referrer.referredBy) {
                  const level3Referrer = await User.findOne({ referralCode: level2Referrer.referredBy });
                  if (level3Referrer) {
                    level3Referrer.levelThreeReferrals.push(newUser.userId);
                    await level3Referrer.save();
                    
                    // Create level 3 bonus record
                    const level3Bonus = new ReferralBonus({
                      user: level3Referrer.userId,
                      referredUser: newUser.userId,
                      level: 3,
                      amount: 0
                    });
                    await level3Bonus.save();
                  }
                }
              }
            }
          }
        }
    
        await newUser.save();
    
        // Generate JWT token
        // const token = jwt.sign(
        //   { userId: newUser._id, email: newUser.email },
        //   process.env.JWT_SECRET,
        //   { expiresIn: '7d' }
        // );
    

        const token = jwt.sign({ id: newUser.userId }, JWT_SECRET, { expiresIn: "2h" });


        res.status(201).json({
          success: true,
          message: "User created successfully. API verification pending...",
          token,
          user: {
            userId: newUser.userId,
            phone: newUser.phone,
            countryCode: newUser.countryCode,
            balance: newUser.balance || 0,
            referredBy: newUser.referredBy,
            referralCode: newUser.referralCode,
            apiVerified: false,
          },
        });
      } 
    } catch (apiError) {
      console.error(`❌ External API error for user ${userId}:`, apiError.message);
    }
  } catch (error) {
    console.error("❌ Error in register function:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
exports.loginUser = async (req, res) => {
  const { userId, password } = req.body;
// console.log(req.body);
  try {
    if (!userId) {
      return res.status(400).json({ message: "User Not Found, Please Login Or Sign Up" });
    }

    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
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
          referredCode: 1,
          timestamp:1,
        },
      },
    ]);

    const token = jwt.sign({ id: user.userId }, JWT_SECRET, { expiresIn: "2h" });

    res.status(200).json({ token, user, response });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.verify =async (req, res) => {
  const authHeader = req.header("Authorization");
  // console.log("userId",authHeader);
  const token = authHeader?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token missing!" }); 
  try {
    const decoded = jwt.verify(token, "Kingbaji");

    const decodedId = decoded?.id;
    const details = await User.aggregate([
      { $match: { userId:decodedId } },
      {
        $project: {
          userId: 1,
          name: 1,
          phone: 1,
          balance: 1,
          
          referredbyCode: 1,
          referredLink: 1,
          referredCode: 1,
          timestamp:1,
        },
      },
    ]);
    // console.log( "decoded",details );
    res.status(200).json({ message: "User authenticated", userId: decoded.id,user:details[0]});
  } catch (error) {
    res.status(400).json({ message: "Invalid token!" });
  }
};




exports.userDetails =async (req, res) => {
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
      { $match: { userId:user.userId } },
      {
        $project: {
          userId: 1,
          name: 1,
          phone: 1,
          balance: 1,
          referredbyCode: 1,
          referredLink: 1,
          referredCode: 1,
          timestamp:1,
        },
      },
    ]);
    // console.log( "decoded",details );
    res.status(200).json({ message: "User balance",user:details[0]});
  } else {
    res.status(200).json({ message: "User game balance is 0",user:details[0]});
  }
  } catch (error) {
    console.log( "error",error );
    res.status(400).json({ message: "Invalid token!" });
  }
};

exports.verifyPhone = async (req, res) => {
  try {
    const { code } = req.body;
    
    if (req.user.verificationCode !== code) {
      return res.status(400).send({ error: 'Invalid verification code' });
    }
    
    if (new Date() > req.user.verificationExpires) {
      return res.status(400).send({ error: 'Verification code expired' });
    }
    
    req.user.phoneVerified = true;
    req.user.verificationCode = '';
    req.user.verificationExpires = null;
    await req.user.save();
    
    res.send({ message: 'Phone number verified successfully' });
  } catch (e) {
    res.status(500).send();
  }
}

// const nodemailer = require("nodemailer");
const { OTP } = require('../Models/Opt');
const generateReferralCode = require('./generateReferralCode');

const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: parseInt(process.env.SMTP_PORT),
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });




exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });

  const record = await OTP.findOne({ email, otp });
  if (!record || record.expiresAt < new Date()) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  let user = await User.findOne({ email });
  if (!user) user = await User.create({ email });

  user.verified.email = true;
  await user.save();

  await OTP.deleteMany({ email });

  return res.json({ message: "Email verified successfully", user });
};



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
