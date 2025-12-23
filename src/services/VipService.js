const mongoose = require("mongoose");
const UserVip = require("../models/UserVip");
const VipPointTransaction = require("../models/VipPointTransaction");
const User = require("../models/User");

exports.ensureVipUser = async (userId) => {
  let vip = await UserVip.findOne({ userId });
  if (!vip) vip = await UserVip.create({ userId });
  return vip;
};

/**
 * Earn VIP points from betting
 */
exports.earnFromBet = async (userId, betAmount) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const vip = await UserVip.findOne({ userId }).session(session);
    const earned = vip.addTurnover(betAmount);

    await vip.save({ session });

    if (earned > 0) {
      await VipPointTransaction.create([{
        userId,
        source: "earned",
        type: "received",
        points: earned,
        balanceAfter: vip.vipPoints,
        description: `Earned from betting (${betAmount})`
      }], { session });
    }

    await session.commitTransaction();
  } catch (e) {
    await session.abortTransaction();
    throw e;
  } finally {
    session.endSession();
  }
};

/**
 * Convert VIP points to balance
 */
exports.convertPoints = async (userId, points) => {
  if (points < 1000) throw new Error("Minimum 1000 VP required");

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const vip = await UserVip.findOne({ userId }).session(session);
    if (!vip || vip.vipPoints < points) {
      throw new Error("Insufficient VIP points");
    }

    const amount = points / 1000;
    vip.vipPoints -= points;
    await vip.save({ session });

    await User.updateOne(
      { userId },
      { $inc: { balance: amount } },
      { session }
    );

    await VipPointTransaction.create([{
      userId,
      source: "conversion",
      type: "used",
      points,
      amount,
      balanceAfter: vip.vipPoints,
      description: "VIP points converted"
    }], { session });

    await session.commitTransaction();
    return amount;
  } catch (e) {
    await session.abortTransaction();
    throw e;
  } finally {
    session.endSession();
  }
};
