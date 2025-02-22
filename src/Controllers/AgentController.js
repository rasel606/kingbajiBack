const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const axios = require("axios");
const crypto = require("crypto");
// const Agent = require("../Models/AgentModel");
const Agent = require("../Models/AgentModel");
// const User = require("../Models/User");


const saltRounds = 12;
const JWT_SECRET = process.env.JWT_SECRET || "Kingbaji";

exports.registerAgent  = async (req, res) => {
  try {
    const { email, phone, password, countryCode, referredbyCode } = req.body;
    if (!email || !phone || !password || !countryCode) {
      return res.status(400).json({ success: false, message: "Please enter all fields" });
    }
console.log("referredbyCode",email, phone, password, countryCode, referredbyCode )
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const referredCode = Math.random().toString(36).substring(2, 9);
    const referrUserCode = Math.random().toString(36).substring(2, 9);
    if (referredbyCode) {
      const referredbyUser = await Agent.findOne({ referredCode: referredCode });
      const referrUser = await Agent.findOneAndDelete({ referredCode: referredCode });
      if(referrUser){
        return res.status(400).json({ success: false, message: "Invalid referred code" });
      }
    }

    const AgentId = Math.random().toString(36).substring(2, 9);




    const existingUser = await Agent.findOne({ email:email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }




    const newUser = await Agent.create({
      email,
      phone,
      countryCode,
      referredbyCode,
      referredCode:referrUserCode || referredCode,
      password: hashedPassword,
      balance: 0,
      AgentId: AgentId,
      isActive: true,
      user_referredLink: `http:/localhost:3000/${referredCode || referrUserCode}`,
      agent_referredLink: `http:/localhost:3000/agent/${referredCode || referrUserCode}`,
      affiliate_referredLink: `http:/localhost:3000/affiliate/${referredCode || referrUserCode}`,
    });

    console.log("newUser",newUser)
    if (!newUser) {
      return res.status(500).json({ success: false, message: "Failed to create user" });
    }

   

    const response = await Agent.aggregate([
        { $match: { email: newUser.email } },
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
          },
        },
      ]);





    // ✅ Step 2: Generate JWT Token (Send Response Immediately)
    const userDetails = response[0];
    console.log("userDetails",userDetails)
    console.log(" response[0]", response[0])

    const token = jwt.sign({ email: userDetails.email, user_role: userDetails.user_role }, JWT_SECRET, { expiresIn: "2h" });
console.log("token",token)


res.status(201).json({
  success: true,

  token,
  userDetails
});

  } catch (error) {
    console.error("❌ Error in register function:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};




///////////////////////////////////////////    login   //////////////////////////////////////////////////

exports.loginAgent = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log(req.body);
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await Agent.findOne({ email:email });
    console.log("user",user)
    if (!user) return res.status(404).json({ message: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: "Invalid password" });


    
    const response = await Agent.aggregate([
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

exports.verifyAgent = async (req, res) => {
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

    const response = await Agent.aggregate([
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
