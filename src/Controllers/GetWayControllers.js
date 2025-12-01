



exports.getPendingDepositTransactions = async (req, res, user, dataModel, ParentUserModel, type) => {

  const { userId, amount, gateway_name, status, startDate, endDate } = req.query;
  console.log("Pending deposit transactions query:", req.query);

  // Get the authenticated user's referral code
  // const user = req.user;
  // console.log("user", user.userId, user.email);

  const ParentUser = await ParentUserModel.find({ email: user.email })


  // console.log("getPendingDepositTransactions -----=========user", ParentUser);

  // if (!ParentUser) {
  //   return res.status(404).json({
  //     success: false,
  //     message: 'User not found'
  //   });
  // }

  // console.log("getPendingDepositTransactions -----=========user", ParentUser);
  console.log("getPendingDepositTransactions -----=========user", ParentUser.role);

  let query = {};
  console.log("query", query);

  // Add optional filters
  if (userId) query.userId = userId;
  if (amount) query.base_amount = { $gte: parseFloat(amount) };
  if (gateway_name) query.gateway_name = gateway_name;
  if (status !== undefined && !isNaN(status) && status !== "") {
    query.status = parseInt(status);
  }

  // Date filtering
  if (startDate && endDate) {
    query.datetime = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  } else if (startDate) {
    query.datetime = { $gte: new Date(startDate) };
  }

  // Handle referredBy based on user role
  let referredByFilter = {};

  if (ParentUser.role === 'Admin') {
    // If user is Admin, get transactions with referredBy as null or undefined
    referredByFilter = {
      $or: [
        { referredBy: null },
        // { referredBy: { $exists: false } }
      ]
    };
  } else {
    // For other roles, use their referral code
    referredByFilter = { referredBy: ParentUser.referralCode };
  }
  console.log("referredByFilter", referredByFilter);
  const transactions = await dataModel.find({
    ...referredByFilter,
    ...query,
    type,
    status: parseInt(1),
  }).sort({ datetime: -1 });

  console.log("transactions", transactions);

  const totalDeposit = await dataModel.aggregate([
    {
      $match: {
        ...query,
        type,
        status: parseInt(0),
        ...referredByFilter
      }
    },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);

  const total = totalDeposit.length > 0 ? totalDeposit[0].total : 0;

  return {
    success: true,
    message: "Deposit transactions fetched successfully",
    transactions: transactions,
    total: total
  }
};



exports.GetWayList = async (req, dataModel) => {
  console.log(req.body);

  try {
    const user = req.user; // comes from your auth middleware
    const { page = 1, limit = 10, gateway_name, startDate, endDate } = req.query;
    console.log("gateway_name", gateway_name, startDate, endDate);
    // Filters

    const filters = { email: user.email, referredBy: user.referralCode }; // only user's deposits
    if (gateway_name) filters.gateway_name = gateway_name;
    if (startDate || endDate) filters.createdAt = {};
    if (startDate) filters.createdAt.$gte = new Date(startDate);
    if (endDate) filters.createdAt.$lte = new Date(endDate);

    const totalCount = await dataModel.countDocuments(filters);

    const totalAmountAggregate = await dataModel.aggregate([
      { $match: filters },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    console.log("totalAmountAggregate", totalAmountAggregate);
    const totalAmount = totalAmountAggregate[0]?.total || 0;

    const deposits = await dataModel.find(filters)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    console.log("deposits", deposits);
    return {
      deposits: deposits,
      total: {
        count: totalCount,
        total: totalAmount,
      },
      success: true,
      message: "Deposit transactions fetched successfully",
    };
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};