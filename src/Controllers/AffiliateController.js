const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const crypto = require("crypto");
const AffiliateModel = require("../Models/AffiliateModel");
const User = require("../Models/User");
const TurnOverModal = require("../Models/TurnOverModal");


const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET || "Kingbaji";

exports.registerAffiliate = async (req, res) => {
  console.log(req.body);
  try {
    const { email,
      phone,
      password,
      firstName,
      lastName,
      dateOfBirth,
      callingCode,
      contactType,
      contactTypeValue,
      countryCode,
      currencyType,
      referredbyCode,
       userId 
  } = req.body;
    if (!email || !phone || !password ) {
      return res.status(400).json({ success: false, message: "Please enter all fields" });
    }
console.log("referredbyCode",email,
  phone,
  password,
  firstName,
  lastName,
  dateOfBirth,
  callingCode,
  contactType,
  contactTypeValue,
  countryCode,
  currencyType,
  referredbyCode,
   userId  )
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const referrUserCode = Math.random().toString(36).substring(2, 13);
    // if (referredbyCode) {
    //   const referredbyUser = await AffiliateModel.findOne({ referredCode: referredCode });
    //   const referrUser = await AffiliateModel.findOneAndDelete({ referredCode: referredCode });
    //   if(referrUser){
    //     return res.status(400).json({ success: false, message: "Invalid referred code" });
    //   }
    // }


    const referredCode1 = Math.random().toString(36).substring(2, 13);



    const existingUser = await AffiliateModel.findOne({ email:email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }




    const newUser = await AffiliateModel.create({
      email:email,
      phone:phone,
      password:hashedPassword,
      firstName:firstName,
      lastName:lastName,
      dateOfBirth:  dateOfBirth,
      callingCode: callingCode,
      contactType:  contactType,
      contactTypeValue:  contactTypeValue,
      countryCode:  countryCode,
      currencyType:  currencyType,
      // referredbyCode,
      referralCode: referredCode1,
      password: hashedPassword,
      balance: 0,
      userId: userId,
      isActive: true,
      affiliate_referredLink: `http:/localhost:3000/affiliate/${referredCode1}`,
    });

    console.log("newUser",newUser)
    if (!newUser) {
      return res.status(500).json({ success: false, message: "Failed to create user" });
    }

   

    const response = await AffiliateModel.aggregate([
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
            referredCode:1,
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

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log(req.body);
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await AffiliateModel.findOne({ email:email });
    console.log("user",user)
    if (!user) return res.status(404).json({ message: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: "Invalid password" });


    
    const response = await AffiliateModel.aggregate([
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

exports.verify = async (req, res) => {
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

    const response = await AffiliateModel.aggregate([
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
          referralCode: 1,
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



//////////////////////////////////////////// getAffiliateDeposits //////////////////////////////////

// এফিলিয়েট ইউজারদের ডিপোজিট ডাটা বের করা
// app.get("/affiliate/deposits/:affiliateId", 
  exports.getAffiliateDeposits = async (req, res) => {
  try {
    const affiliateId = req.params.affiliateId;
    const now = new Date();
    const last7Days = new Date(now);
    last7Days.setDate(last7Days.getDate() - 7);

    const prev7Days = new Date(last7Days);
    prev7Days.setDate(prev7Days.getDate() - 7);

    // প্রথম লেভেলের ইউজার খোঁজা
    const users = await User.find({ referrerId: affiliateId }).select("_id");
    const userIds = users.map((user) => user._id);

    // ট্রান্সজেকশন অ্যাগ্রিগেশন
    const deposits = await Transaction.aggregate([
      {
        $match: {
          userId: { $in: userIds },
          type: "deposit",
          createdAt: { $gte: prev7Days },
        },
      },
      {
        $group: {
          _id: {
            period: {
              $cond: [{ $gte: ["$createdAt", last7Days] }, "last_7_days", "prev_7_days"],
            },
          },
          totalDeposit: { $sum: "$amount" },
        },
      },
    ]);

    // রেসপন্স ফরম্যাটিং
    let result = { last_7_days: 0, prev_7_days: 0 };
    deposits.forEach((dep) => {
      result[dep._id.period] = dep.totalDeposit;
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

//////////////////////////////////////////////////// getAffiliateUsersStats //////////////////////////////////

// app.get("/affiliate/users/stats/:affiliateId", 
exports.getAffiliateUsersStats = async (req, res) => {
  try {
    const { affiliateId } = req.params;
    
    // তারিখের সীমা সেট করা
    const today = moment().startOf("day").toDate();
    const yesterday = moment().subtract(1, "days").startOf("day").toDate();
    const last7Days = moment().subtract(7, "days").startOf("day").toDate();
    const prev7Days = moment().subtract(14, "days").startOf("day").toDate();
    const startOfMonth = moment().startOf("month").toDate();
    const startOfLastMonth = moment().subtract(1, "months").startOf("month").toDate();
    const endOfLastMonth = moment().subtract(1, "months").endOf("month").toDate();

    // MongoDB Aggregation Pipeline
    const stats = await User.aggregate([
      {
        $match: { affiliateId: new mongoose.Types.ObjectId(affiliateId) },
      },
      {
        $group: {
          _id: null,
          today: { $sum: { $cond: [{ $gte: ["$createdAt", today] }, 1, 0] } },
          yesterday: { $sum: { $cond: [{ $gte: ["$createdAt", yesterday], $lt: ["$createdAt", today] }, 1, 0] } },
          last7Days: { $sum: { $cond: [{ $gte: ["$createdAt", last7Days] }, 1, 0] } },
          prev7Days: { $sum: { $cond: [{ $gte: ["$createdAt", prev7Days], $lt: ["$createdAt", last7Days] }, 1, 0] } },
          thisMonth: { $sum: { $cond: [{ $gte: ["$createdAt", startOfMonth] }, 1, 0] } },
          lastMonth: { $sum: { $cond: [{ $gte: ["$createdAt", startOfLastMonth], $lt: ["$createdAt", endOfLastMonth] }, 1, 0] } },
        },
      },
    ]);

    res.json(stats[0] || {
      today: 0,
      yesterday: 0,
      last7Days: 0,
      prev7Days: 0,
      thisMonth: 0,
      lastMonth: 0,
    });

  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}



///////////////////////////////////////// getAffiliateFirstDeposits //////////////////////////////////////////////


// router.get('/affiliate-deposits/:affiliateId', 
  
  exports.getAffiliateFirstDeposits = async (req, res) => {
  try {
    const { affiliateId } = req.params;
    const today = moment().startOf('day');
    const yesterday = moment().subtract(1, 'days').startOf('day');
    const last7Days = moment().subtract(7, 'days').startOf('day');
    const prev7Days = moment().subtract(14, 'days').startOf('day');
    const startOfMonth = moment().startOf('month');
    const startOfLastMonth = moment().subtract(1, 'months').startOf('month');
    const endOfLastMonth = moment().subtract(1, 'months').endOf('month');

    const pipeline = [
      { $match: { affiliateId } },
      { $sort: { createdAt: 1 } },
      { $group: { _id: "$userId", firstDeposit: { $first: "$createdAt" }, amount: { $first: "$amount" } } }
    ];

    const firstDeposits = await Transaction.aggregate(pipeline);

    const result = {
      today: firstDeposits.filter(d => moment(d.firstDeposit).isSame(today, 'day')),
      yesterday: firstDeposits.filter(d => moment(d.firstDeposit).isSame(yesterday, 'day')),
      last7Days: firstDeposits.filter(d => moment(d.firstDeposit).isBetween(last7Days, today, 'day', '[]')),
      prev7Days: firstDeposits.filter(d => moment(d.firstDeposit).isBetween(prev7Days, last7Days, 'day', '[]')),
      thisMonth: firstDeposits.filter(d => moment(d.firstDeposit).isSameOrAfter(startOfMonth)),
      lastMonth: firstDeposits.filter(d => moment(d.firstDeposit).isBetween(startOfLastMonth, endOfLastMonth, 'day', '[]'))
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}



////////////////////////////////////////////////// getAffiliateWithdrawals //////////////////////////////////////////////

// app.get("/affiliate/withdrawals/:affiliateId", 
  exports.getAffiliateWithdrawals = async (req, res) => {
  try {
    const { affiliateId } = req.params;
    const now = new Date();
    
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const startOfYesterday = new Date(new Date().setDate(new Date().getDate() - 1));
    const startOf7DaysAgo = new Date(new Date().setDate(new Date().getDate() - 7));
    const startOfPrevious7Days = new Date(new Date().setDate(new Date().getDate() - 14));
    const startOfMonth = new Date(new Date().setDate(1));
    const startOfLastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1, 1));
    const endOfLastMonth = new Date(new Date().setDate(0));

    const withdrawals = await Transaction.aggregate([
      {
        $match: { 
          affiliateId: new mongoose.Types.ObjectId(affiliateId), 
          type: "withdraw"
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $gte: ["$createdAt", startOfToday] }, "today",
              { $gte: ["$createdAt", startOfYesterday] }, "yesterday",
              { $gte: ["$createdAt", startOf7DaysAgo] }, "last_7_days",
              { $gte: ["$createdAt", startOfPrevious7Days] }, "previous_7_days",
              { $gte: ["$createdAt", startOfMonth] }, "this_month",
              { $gte: ["$createdAt", startOfLastMonth], $lte: ["$createdAt", endOfLastMonth] }, "last_month",
              "older"
            ]
          },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


//////////////////////////////////////////// getAffiliateBonuses //////////////////////////////////////////


// app.get('/affiliate/bonuses', 
  
  exports.getAffiliateBonuses = async (req, res) => {
  const affiliateUserId = req.query.affiliateUserId; // এফিলিয়েটরের userId
  const firstUsersLimit = 10; // প্রথম ১০ জন ইউজার

  try {
    // প্রথম কয়েকটি ইউজার খুঁজে বের করা
    const users = await User.find({ affiliateId: affiliateUserId }).limit(firstUsersLimit);

    // প্রতিটি ইউজারের জন্য বোনাস হিসাব করা
    const bonuses = await Promise.all(users.map(async (user) => {
      const userBonuses = await Bonus.aggregate([
        { $match: { userId: user._id } },
        {
          $project: {
            userId: 1,
            amount: 1,
            date: 1,
            todayBonus: {
              $cond: [
                { $gte: [{ $subtract: [new Date(), '$date'] }, 86400000] }, // 1 দিন
                '$amount',
                0
              ]
            },
            yesterdayBonus: {
              $cond: [
                { $gte: [{ $subtract: [new Date(), '$date'] }, 172800000] }, // 2 দিন
                '$amount',
                0
              ]
            },
            last7DaysBonus: {
              $cond: [
                { $gte: [{ $subtract: [new Date(), '$date'] }, 604800000] }, // 7 দিন
                '$amount',
                0
              ]
            },
            thisMonthBonus: {
              $cond: [
                { $gte: [{ $month: '$date' }, moment().month() + 1] },
                '$amount',
                0
              ]
            },
            lastMonthBonus: {
              $cond: [
                { $gte: [{ $month: '$date' }, moment().month()] },
                '$amount',
                0
              ]
            },
          }
        }
      ]);

      return {
        userId: user._id,
        bonuses: userBonuses,
      };
    }));

    res.json(bonuses);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching bonuses');
  }
}




////////////////////////////////////////////// getAffiliateRefferalBonuses //////////////////////////////////////////

const calculateCommissions = async (affiliateId) => {
  const todayStart = getStartOfDay(new Date());
  const yesterdayStart = getStartOfDay(moment().subtract(1, 'day').toDate());
  const last7DaysStart = getStartOfDay(moment().subtract(7, 'days').toDate());
  const prev7DaysStart = getStartOfDay(moment().subtract(14, 'days').toDate());
  const thisMonthStart = getStartOfMonth(new Date());
  const lastMonthStart = getStartOfPreviousMonth(new Date());

  const pipeline = [
    {
      $match: {
        referredBy: mongoose.Types.ObjectId(affiliateId),
      }
    },
    {
      $unwind: '$commissionHistory'
    },
    {
      $project: {
        userId: 1,
        commissionHistory: 1,
        isToday: { $gte: ['$commissionHistory.date', todayStart] },
        isYesterday: { $and: [{ $gte: ['$commissionHistory.date', yesterdayStart] }, { $lt: ['$commissionHistory.date', todayStart] }] },
        isLast7Days: { $gte: ['$commissionHistory.date', last7DaysStart] },
        isPrev7Days: { $and: [{ $gte: ['$commissionHistory.date', prev7DaysStart] }, { $lt: ['$commissionHistory.date', last7DaysStart] }] },
        isThisMonth: { $gte: ['$commissionHistory.date', thisMonthStart] },
        isLastMonth: { $and: [{ $gte: ['$commissionHistory.date', lastMonthStart] }, { $lt: ['$commissionHistory.date', thisMonthStart] }] }
      }
    },
    {
      $group: {
        _id: '$userId',
        totalCommissionToday: { $sum: { $cond: [{ $eq: ['$isToday', true] }, '$commissionHistory.commission', 0] } },
        totalCommissionYesterday: { $sum: { $cond: [{ $eq: ['$isYesterday', true] }, '$commissionHistory.commission', 0] } },
        totalCommissionLast7Days: { $sum: { $cond: [{ $eq: ['$isLast7Days', true] }, '$commissionHistory.commission', 0] } },
        totalCommissionPrev7Days: { $sum: { $cond: [{ $eq: ['$isPrev7Days', true] }, '$commissionHistory.commission', 0] } },
        totalCommissionThisMonth: { $sum: { $cond: [{ $eq: ['$isThisMonth', true] }, '$commissionHistory.commission', 0] } },
        totalCommissionLastMonth: { $sum: { $cond: [{ $eq: ['$isLastMonth', true] }, '$commissionHistory.commission', 0] } }
      }
    }
  ];

  const commissions = await User.aggregate(pipeline);
  return commissions;
};

// app.get('/affiliate/commissions/:affiliateId', 
  
  exports.getAffiliateCommissions = async (req, res) => {
  const { affiliateId } = req.params;
  try {
    const commissions = await calculateCommissions(affiliateId);
    res.json(commissions);
  } catch (err) {
    res.status(500).json({ error: 'Error calculating commissions' });
  }
}


///////////////////////////////////////  Turnover Controller  /////////////////////////////////////////

const getDateRange = (range) => {
  const today = new Date();
  let startDate;
  switch (range) {
    case 'today':
      startDate = new Date(today.setHours(0, 0, 0, 0));
      break;
    case 'yesterday':
      startDate = new Date(today.setDate(today.getDate() - 1));
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'last7':
      startDate = new Date(today.setDate(today.getDate() - 7));
      break;
    case 'prev7':
      startDate = new Date(today.setDate(today.getDate() - 14));
      startDate.setDate(startDate.getDate() + 7);
      break;
    case 'thisMonth':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
    case 'lastMonth':
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      break;
    default:
      startDate = new Date(today.setFullYear(today.getFullYear() - 1)); // Default to last year
  }
  return startDate;
};

// Get turnover data for a specific range
// router.get('/turnover/:range', 
  
  exports.getTurnoverData = async (req, res) => {
  const { range } = req.params;
  const startDate = getDateRange(range);

  try {
    const turnovers = await TurnOverModal.aggregate([
      {
        $match: {
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$userId',
          totalTurnover: { $sum: '$turnoverAmount' },
        },
      },
    ]);

    res.json(turnovers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

