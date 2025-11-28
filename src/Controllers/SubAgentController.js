const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const axios = require("axios");
const crypto = require("crypto");
const SubAgentModel = require("../Models/SubAgentModel");
// const User = require("../Models/User");
const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/AppError');

const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET || "Kingbaji";

exports.AgentRegister  = catchAsync(async (req, res, next)=> {
  try {
     console.log("📥 Creating admin with data:", req.body);
 
     const result = await createUser(req, SubAgentModel, 'SubAgent');
 
     if (result.success) {
       console.log("✅ Admin created successfully", result);
       const getway = await CreateGateWayService(result.data.user);
 
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
         success: getway.message,
         success: true,
       });
     }
   } catch (err) {
     next(err);
   }
});




///////////////////////////////////////////    login   //////////////////////////////////////////////////

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log(req.body);
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await SubAgentModel.findOne({ email:email });
    console.log("user",user)
    if (!user) return res.status(404).json({ message: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: "Invalid password" });


    
    const response = await SubAgentModel.aggregate([
        { $match: { email: user.email } },
        {
          $project: {
            email: 1,
            name: 1,
            phone: 1,
            countryCode: 1,
            balance: 1,
            referralByCode: 1,
            // referredLink: 1,
            user_referredLink: 1,
            agent_referredLink: 1,
            affiliate_referredLink: 1,
            referralCode: 1,
            user_role:1,
            _id:0
          },
        },
      ]);
      
      if (!response.length) return res.status(500).json({ message: "Error fetching user data" });

      const userDetails = response[0];
      console.log("userDetails",userDetails)
      const token = jwt.sign({ email: userDetails.email, user_role: userDetails.user_role }, JWT_SECRET, { expiresIn: "2h" });
      console.log("userDetails",userDetails)
    
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
    const authHeader = req.header("Authorization");
    const token = authHeader?.split(" ")[1];
    
    if (!token) return res.status(401).json({ message: "Token missing!" });

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded Token:", decoded);

    const decodedEmail = decoded?.email;
    const decodedRole = decoded?.user_role; // Fix role field

    if (!decodedEmail || !decodedRole) {
      return res.status(400).json({ message: "Invalid token payload!" });
    }

    const response = await SubAgentModel.aggregate([
      { $match: { email: decodedEmail, user_role: decodedRole } },
      {
        $project: {
          email: 1,
          name: 1,
          phone: 1,
          countryCode: 1,
          balance: 1,
          referredbyCode: 1,
          referredLink: 1,
          referredCode: 1,
          user_role: 1,
          isActive: 1,
        },
      },
    ]);

    const userDetails = response[0];

    if (userDetails.length === 0) return res.status(404).json({ message: "User not found" });



    res.status(200).json({
      success: true,
      token,
      userDetails,
    });

  } catch (error) {
    console.error("Token verification error:", error);
    res.status(400).json({ message: "Invalid token!" });
  }
};
