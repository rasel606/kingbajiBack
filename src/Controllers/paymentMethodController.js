// controllers/paymentMethodController.js

const { getPaymentMethodsForUser } = require('../Utils/getPaymentMethods');

const PaymentGateWayTable = require('../Models/PaymentGateWayTable');
const User = require('../Models/User');


const { getUserWithReferralLevels, getReferralOwner } = require('../Services/getReferralOwner');

exports.GetUserPayMethods = async (req, res) => {
    try {
        const reqUser = req.user;
        console.log("Received userId:", reqUser);

        const user = await User.findOne({ userId: reqUser.userId });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // ================================================================
        // 1️⃣ User’s own payment methods
        // ================================================================
        const userOwnGateways = await PaymentGateWayTable.find({
            referredBy: user.referralCode,
            is_active: true,
        });

        // ================================================================
        // 2️⃣ Get referral chain (LEVEL 1,2,3)
        // ================================================================
        const referralData = await getUserWithReferralLevels(user.userId);
        console.log("referralData", referralData);
        if (!referralData) {
            return res.json({
                success: true,
                userOwnGateways: [],
                ownerGateways: []
            });
        }

        // → Build owner list: parent + parent’s parent + parent’s parent (LEVEL 1,2,3)
        //     const gatewayOwnersList = [
        //       ...referralData.levelOneReferrals,
        //       ...referralData.levelTwoReferrals,
        //       ...referralData.levelThreeReferrals
        //     ];


        //     // Only keep referralCode list

        //     const referredByList = referralData.map(o => o.referralCode);
        // console.log("referredByList", referredByList);
        const gatewayOwnerNew = await getReferralOwner(referralData.referredBy);
        console.log("gatewayOwner", gatewayOwnerNew.referralCode);
        console.log("gatewayOwner", gatewayOwnerNew.owner);
        // ================================================================
        // 3️⃣ Fetch owner gateways (Time based)
        // ================================================================
        const now = new Date();
        const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

        const ownerGateways = await PaymentGateWayTable.find({
            referredBy: gatewayOwnerNew?.referralCode,
        });

        console.log("ownerGateways", ownerGateways);

        // ================================================================
        // 4️⃣ Attach owner info to each gateway
        // ================================================================
        const ownerGatewaysWithInfo = ownerGateways.map(method => {
            // const owner = gatewayOwnersList.find(
            //     o => o.referralCode === method.referredBy
            // );

            const owner = gatewayOwnerNew;
            return {
                ...method.toObject(),
                ownerName: owner?.name || "Unknown",
                // ownerId: owner?._id,
                ownerReferralCode: owner?.referralCode,
            };
        });
        console.log("ownerGatewaysWithInfo", ownerGatewaysWithInfo);
        // ================================================================
        // 5️⃣ Response
        // ================================================================
        return res.json({
            success: true,
            userOwnGateways,
            ownerGateways: ownerGatewaysWithInfo,
        });

    } catch (err) {
        console.log("GetUserPayMethods ERROR:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};






exports.GetDirectDownlineTransactions = async (parentModel, childModel, subChildModel, transactionModel, user, query) => {
    try {
        if (!user) return { success: false, message: "User not found" };

        // ==============================
        // GET PARENT
        // ==============================
        const parent = await parentModel.findOne({ referralCode: user.referralCode });
        if (!parent) return { success: false, message: "Parent not found" };

        // ==============================
        // STEP 01: Only direct children
        // ==============================
        const children = await childModel.find({ referredBy: parent.referralCode });
        let allUserIds = [];

        for (const child of children) {
            const directUsers = await subChildModel.find({ referredBy: child.referralCode });
            directUsers.forEach(u => allUserIds.push(u.userId));
        }

        if (query.userId) {
            // যদি কুইরিতে userId থাকে, তাহলে শুধু ঐ userId এর ট্রানজেকশন দেখাবে
            allUserIds = allUserIds.filter(id => id === query.userId);
        }

        // ==============================
        // STEP 02: Fetch Transactions
        // ==============================
        const filter = { userId: { $in: allUserIds } };

        if (query.status) filter.status = query.status;
        if (query.type) filter.type = query.type;

        const limit = parseInt(query.limit) || 10;
        const page = parseInt(query.page) || 1;
        const skip = (page - 1) * limit;

        const transactions = await transactionModel
            .find(filter)
            .sort({ createdAt: -1 }) // নতুন থেকে পুরানো
            .skip(skip)
            .limit(limit);

        const total = await transactionModel.countDocuments(filter);

        return {
            success: true,
            page,
            limit,
            total,
            transactions
        };

    } catch (error) {
        console.error("GetDirectDownlineTransactions Error", error);
        return { success: false, message: "Server error" };
    }
};





exports.GetParentAndDownlineTransactions = async (ParentUserModel, childModel, subChildModel, transactionModel, user, query) => {
    try {
        if (!user) return { success: false, message: "User not found" };

        // ==============================
        // GET PARENT
        // ==============================
        const parent = await ParentUserModel.findOne({ referralCode: user.referralCode });
        if (!parent) return { success: false, message: "Parent not found" };
console.log("parent", parent);
        // ==============================
        // STEP 01: Only direct children
        // ==============================
        const children = await childModel.find({ referredBy: parent.referralCode });
        let allUserIds = [parent.userId]; // ParentUser এর নিজের userId প্রথমেই যোগ করলাম
console.log("children", children);
console.log("allUserIds", allUserIds);
        for (const child of children) {
            const directUsers = await subChildModel.find({ referredBy: child.referralCode });
            directUsers.forEach(u => allUserIds.push(u.userId));
        }

        // যদি কুইরিতে userId থাকে
        if (query.userId) {
            allUserIds = allUserIds.filter(id => id === query.userId);
        }

        // ==============================
        // STEP 02: Fetch Transactions
        // ==============================
        const filter = { userId: { $in: allUserIds } };

        if (query.status !== undefined) filter.status = parseInt(query.status);
        if (query.type) filter.type = query.type;

        const limit = parseInt(query.limit) || 10;
        const page = parseInt(query.page) || 1;
        const skip = (page - 1) * limit;
console.log("filter", filter);
        const transactions = await transactionModel
            .find(filter)
            .sort({ createdAt: -1 }) // নতুন থেকে পুরানো
            .skip(skip)
            .limit(limit);
console.log("transactions", transactions);
        const total = await transactionModel.countDocuments(filter);

        return {
            success: true,
            page,
            limit,
            total,
            transactions
        };

    } catch (error) {
        console.error("GetParentAndDownlineTransactions Error", error);
        return { success: false, message: "Server error" };
    }
};
