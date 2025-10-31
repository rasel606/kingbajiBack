



exports.getUserListServices = async (req, dataModel) => {

    const { page = 1, limit = 100, userId, email } = req.query;
    const requstedUser = req.user
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized: No user in request" });
    }

    const filters = {};
    if (userId) filters.userId = userId;
    if (email) filters.email = email;
    if (req.referralCode) filters.referredBy = requstedUser.referralCode;

    const users = await dataModel.find(filters)
        .select('userId name phone balance referredBy referralCode email country countryCode isVerified timestamp isActive birthday last_game_id')
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

    return {
        message: "User Profile successful",
        success: true,
        data: {
            count: users.length,
            data: users
        }
    }

};
