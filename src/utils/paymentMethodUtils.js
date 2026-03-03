// // utils/paymentMethodUtils.js

// const PaymentGateWayTable = require("../Models/PaymentGateWayTable");
// const User = require("../Models/User");

// // Get payment methods for a specific user level
// const getPaymentMethodsForUserLevel = async (user, level) => {
//     try {
//         const now = new Date();
//         const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

//         const paymentMethods = await PaymentGateWayTable.find({
//             referredBy: user.referralCode,
//             is_active: true,
//             startTotalMinutes: { $lte: currentTotalMinutes },
//             endTotalMinutes: { $gte: currentTotalMinutes }
//         }).select(
//             "gateway_name gateway_Number payment_type image_url start_time end_time is_active minimun_amount maximum_amount referredBy"
//         );

//         return paymentMethods.map(method => ({
//             ...method.toObject(),
//             userLevel: level,
//             userName: user.name,
//             userId: user.userId
//         }));
//     } catch (error) {
//         console.error(`Error getting payment methods for level ${level}:`, error);
//         return [];
//     }
// };

// // Get user with referral levels (for gateway owners)
// const getUserWithReferralLevels = async (referralCode, maxLevel = 3) => {
//     const result = [];
//     let currentLevel = 1;
//     let currentReferralCode = referralCode;

//     while (currentLevel <= maxLevel && currentReferralCode) {
//         const user = await User.findOne({ referralCode: currentReferralCode });
//         if (!user) break;

//         result.push({
//             ...user.toObject(),
//             level: currentLevel
//         });

//         currentReferralCode = user.referredBy;
//         currentLevel++;
//     }

//     return result;
// };

// // Get referral owner data
// const getReferralOwner = async (user) => {
//     const result = {
//         levelOneUsers: [],
//         levelTwoUsers: [],
//         levelThreeUsers: [],
//         levelOneGateways: 0,
//         levelTwoGateways: 0,
//         levelThreeGateways: 0
//     };

//     try {
//         // Level 1 - Direct referrals
//         const levelOneUsers = await User.find({ referredBy: user.referralCode });
//         result.levelOneUsers = levelOneUsers;

//         // Get level 1 gateways
//         for (const levelOneUser of levelOneUsers) {
//             const gateways = await PaymentGateWayTable.countDocuments({
//                 referredBy: levelOneUser.referralCode,
//                 is_active: true
//             });
//             result.levelOneGateways += gateways;
//         }

//         // Level 2 - Referrals of referrals
//         if (levelOneUsers.length > 0) {
//             const levelOneReferralCodes = levelOneUsers.map(u => u.referralCode);
//             const levelTwoUsers = await User.find({
//                 referredBy: { $in: levelOneReferralCodes }
//             });
//             result.levelTwoUsers = levelTwoUsers;

//             // Get level 2 gateways
//             for (const levelTwoUser of levelTwoUsers) {
//                 const gateways = await PaymentGateWayTable.countDocuments({
//                     referredBy: levelTwoUser.referralCode,
//                     is_active: true
//                 });
//                 result.levelTwoGateways += gateways;
//             }

//             // Level 3
//             if (levelTwoUsers.length > 0) {
//                 const levelTwoReferralCodes = levelTwoUsers.map(u => u.referralCode);
//                 const levelThreeUsers = await User.find({
//                     referredBy: { $in: levelTwoReferralCodes }
//                 });
//                 result.levelThreeUsers = levelThreeUsers;

//                 // Get level 3 gateways
//                 for (const levelThreeUser of levelThreeUsers) {
//                     const gateways = await PaymentGateWayTable.countDocuments({
//                         referredBy: levelThreeUser.referralCode,
//                         is_active: true
//                     });
//                     result.levelThreeGateways += gateways;
//                 }
//             }
//         }

//         return result;
//     } catch (error) {
//         console.error("Error getting referral owner:", error);
//         return result;
//     }
// };

// // Get payment methods for all levels
// const getPaymentMethodsForAllLevels = async (user) => {
//     const result = {
//         levelOne: [],
//         levelTwo: [],
//         levelThree: [],
//         self: []
//     };

//     try {
//         // Get payment method for the user themselves (who referred them)
//         if (user.referredBy) {
//             result.self = await getPaymentMethodsForUserLevel(user, 'self');
//         }

//         // Level 1 users - direct referrals
//         const levelOneUsers = await User.find({ referredBy: user.referralCode });
//         for (const levelOneUser of levelOneUsers) {
//             const paymentMethods = await getPaymentMethodsForUserLevel(levelOneUser, 1);
//             result.levelOne.push({
//                 userId: levelOneUser.userId,
//                 userName: levelOneUser.name,
//                 paymentMethods: paymentMethods
//             });
//         }

//         // Level 2 users - referrals of referrals
//         if (levelOneUsers.length > 0) {
//             const levelOneReferralCodes = levelOneUsers.map(u => u.referralCode);
//             const levelTwoUsers = await User.find({
//                 referredBy: { $in: levelOneReferralCodes }
//             });

//             for (const levelTwoUser of levelTwoUsers) {
//                 const paymentMethods = await getPaymentMethodsForUserLevel(levelTwoUser, 2);
//                 result.levelTwo.push({
//                     userId: levelTwoUser.userId,
//                     userName: levelTwoUser.name,
//                     referredBy: levelTwoUser.referredBy,
//                     paymentMethods: paymentMethods
//                 });
//             }

//             // Level 3 users
//             if (levelTwoUsers.length > 0) {
//                 const levelTwoReferralCodes = levelTwoUsers.map(u => u.referralCode);
//                 const levelThreeUsers = await User.find({
//                     referredBy: { $in: levelTwoReferralCodes }
//                 });

//                 for (const levelThreeUser of levelThreeUsers) {
//                     const paymentMethods = await getPaymentMethodsForUserLevel(levelThreeUser, 3);
//                     result.levelThree.push({
//                         userId: levelThreeUser.userId,
//                         userName: levelThreeUser.name,
//                         referredBy: levelThreeUser.referredBy,
//                         paymentMethods: paymentMethods
//                     });
//                 }
//             }
//         }

//         return result;

//     } catch (error) {
//         console.error("Error getting payment methods for all levels:", error);
//         throw error;
//     }
// };

// // Get payment methods for specific levels only
// const getPaymentMethodsByLevel = async (user, levels = [1, 2, 3]) => {
//     const result = {};

//     for (const level of levels) {
//         result[`level${level}`] = [];
//     }

//     // Level 1
//     if (levels.includes(1)) {
//         const levelOneUsers = await User.find({ referredBy: user.referralCode });
//         for (const levelOneUser of levelOneUsers) {
//             const paymentMethods = await getPaymentMethodsForUserLevel(levelOneUser, 1);
//             result.level1.push({
//                 userId: levelOneUser.userId,
//                 userName: levelOneUser.name,
//                 paymentMethods: paymentMethods
//             });
//         }
//     }

//     // Level 2
//     if (levels.includes(2)) {
//         const levelOneUsers = await User.find({ referredBy: user.referralCode });
//         if (levelOneUsers.length > 0) {
//             const levelOneReferralCodes = levelOneUsers.map(u => u.referralCode);
//             const levelTwoUsers = await User.find({
//                 referredBy: { $in: levelOneReferralCodes }
//             });

//             for (const levelTwoUser of levelTwoUsers) {
//                 const paymentMethods = await getPaymentMethodsForUserLevel(levelTwoUser, 2);
//                 result.level2.push({
//                     userId: levelTwoUser.userId,
//                     userName: levelTwoUser.name,
//                     paymentMethods: paymentMethods
//                 });
//             }
//         }
//     }

//     // Level 3
//     if (levels.includes(3)) {
//         const levelOneUsers = await User.find({ referredBy: user.referralCode });
//         if (levelOneUsers.length > 0) {
//             const levelOneReferralCodes = levelOneUsers.map(u => u.referralCode);
//             const levelTwoUsers = await User.find({
//                 referredBy: { $in: levelOneReferralCodes }
//             });

//             if (levelTwoUsers.length > 0) {
//                 const levelTwoReferralCodes = levelTwoUsers.map(u => u.referralCode);
//                 const levelThreeUsers = await User.find({
//                     referredBy: { $in: levelTwoReferralCodes }
//                 });

//                 for (const levelThreeUser of levelThreeUsers) {
//                     const paymentMethods = await getPaymentMethodsForUserLevel(levelThreeUser, 3);
//                     result.level3.push({
//                         userId: levelThreeUser.userId,
//                         userName: levelThreeUser.name,
//                         paymentMethods: paymentMethods
//                     });
//                 }
//             }
//         }
//     }

//     return result;
// };

// module.exports = {
//     getPaymentMethodsForUserLevel,
//     getUserWithReferralLevels,
//     getReferralOwner,
//     getPaymentMethodsForAllLevels,
//     getPaymentMethodsByLevel
// };



const PaymentGateWayTable = require("../Models/PaymentGateWayTable");
const User = require("../Models/User");
const AgentModel = require("../Models/AgentModel");
const SubAgentModel = require("../Models/SubAgentModel");
// Get payment methods for a specific user level
const getPaymentMethodsForUserLevel = async (user, level) => {
    try {
        const now = new Date();
        const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

        const paymentMethods = await PaymentGateWayTable.find({
            referredBy: user.referralCode,
            is_active: true,
            startTotalMinutes: { $lte: currentTotalMinutes },
            endTotalMinutes: { $gte: currentTotalMinutes }
        }).sort({ priority: 1 });

        return paymentMethods.map(method => ({
            ...method.toObject(),
            userLevel: level,
            userName: user.name,
            userId: user.userId
        }));
    } catch (error) {
        console.error(`Error getting payment methods for level ${level}:`, error);
        return [];
    }
};

// Get user with referral levels (for gateway owners)
const getUserWithReferralLevels = async (referralCode, maxLevel = 3) => {
    try {
        const result = [];
        let currentLevel = 1;
        let currentReferralCode = referralCode;

        while (currentLevel <= maxLevel && currentReferralCode) {
            const user = await User.findOne({ referralCode: currentReferralCode });
            if (!user) break;

            result.push({
                ...user.toObject(),
                level: currentLevel
            });

            currentReferralCode = user.referredBy;
            currentLevel++;
        }

        return result;
    } catch (error) {
        console.error("Error in getUserWithReferralLevels:", error);
        throw error;
    }
};

// Get referral owner data
// const getReferralOwner = async (user) => {
//     const result = {
//         levelOneUsers: [],
//         levelTwoUsers: [],
//         levelThreeUsers: [],
//         levelOneGateways: 0,
//         levelTwoGateways: 0,
//         levelThreeGateways: 0
//     };

//     try {
//         // Level 1 - Direct referrals
//         const levelOneUsers = await User.find({ referredBy: user.referralCode });
//         result.levelOneUsers = levelOneUsers;

//         // Get level 1 gateways
//         for (const levelOneUser of levelOneUsers) {
//             const gateways = await PaymentGateWayTable.countDocuments({
//                 referredBy: levelOneUser.referralCode,
//                 is_active: true
//             });
//             result.levelOneGateways += gateways;
//         }

//         // Level 2 - Referrals of referrals
//         if (levelOneUsers.length > 0) {
//             const levelOneReferralCodes = levelOneUsers.map(u => u.referralCode);
//             const levelTwoUsers = await User.find({
//                 referredBy: { $in: levelOneReferralCodes }
//             });
//             result.levelTwoUsers = levelTwoUsers;

//             // Get level 2 gateways
//             for (const levelTwoUser of levelTwoUsers) {
//                 const gateways = await PaymentGateWayTable.countDocuments({
//                     referredBy: levelTwoUser.referralCode,
//                     is_active: true
//                 });
//                 result.levelTwoGateways += gateways;
//             }

//             // Level 3
//             if (levelTwoUsers.length > 0) {
//                 const levelTwoReferralCodes = levelTwoUsers.map(u => u.referralCode);
//                 const levelThreeUsers = await User.find({
//                     referredBy: { $in: levelTwoReferralCodes }
//                 });
//                 result.levelThreeUsers = levelThreeUsers;

//                 // Get level 3 gateways
//                 for (const levelThreeUser of levelThreeUsers) {
//                     const gateways = await PaymentGateWayTable.countDocuments({
//                         referredBy: levelThreeUser.referralCode,
//                         is_active: true
//                     });
//                     result.levelThreeGateways += gateways;
//                 }
//             }
//         }

//         return result;
//     } catch (error) {
//         console.error("Error getting referral owner:", error);
//         return result;
//     }
// };

// Reusable Referral Owner Summary Generator
const getReferralOwner = async (user, models) => {
    // models = { UserModel, AgentModel, SubAgentModel }

    const { UserModel, AgentModel, SubAgentModel } = models;

    const result = {
        levelOneUsers: [],
        levelTwoUsers: [],
        levelThreeUsers: [],
        levelOneGateways: 0,
        levelTwoGateways: 0,
        levelThreeGateways: 0
    };

    try {
        // Detect user group (user / agent / subagent)
        const userGroup = user.userGroup?.toLowerCase();

        // Step 1: Select search model based on user type
        let currentModel = UserModel; // default

        if (userGroup === "agent") currentModel = AgentModel;
        if (userGroup === "subagent") currentModel = SubAgentModel;

        // ------- LEVEL 1 -------
        const levelOneUsers = await currentModel.find({
            referredBy: user.referralCode
        });

        result.levelOneUsers = levelOneUsers;

        // Count level 1 gateways
        const levelOneReferralCodes = levelOneUsers.map(u => u.referralCode);

        result.levelOneGateways = await PaymentGateWayTable.countDocuments({
            referredBy: { $in: levelOneReferralCodes },
            is_active: true
        });

        // ------- LEVEL 2 -------
        if (levelOneUsers.length > 0) {
            const levelTwoUsers = await currentModel.find({
                referredBy: { $in: levelOneReferralCodes }
            });

            result.levelTwoUsers = levelTwoUsers;

            const levelTwoReferralCodes = levelTwoUsers.map(u => u.referralCode);

            result.levelTwoGateways = await PaymentGateWayTable.countDocuments({
                referredBy: { $in: levelTwoReferralCodes },
                is_active: true
            });

            // ------- LEVEL 3 -------
            if (levelTwoUsers.length > 0) {
                const levelThreeUsers = await currentModel.find({
                    referredBy: { $in: levelTwoReferralCodes }
                });

                result.levelThreeUsers = levelThreeUsers;

                const levelThreeReferralCodes = levelThreeUsers.map(u => u.referralCode);

                result.levelThreeGateways = await PaymentGateWayTable.countDocuments({
                    referredBy: { $in: levelThreeReferralCodes },
                    is_active: true
                });
            }
        }

        return result;

    } catch (error) {
        console.error("Error in getReferralOwner:", error);
        return result;
    }
};


// Get payment methods for all levels
const getPaymentMethodsForAllLevels = async (user) => {
    const result = {
        levelOne: [],
        levelTwo: [],
        levelThree: [],
        self: []
    };

    try {
        // Get payment method for the user themselves (who referred them)
        if (user.referredBy) {
            const referrer = await User.findOne({ referralCode: user.referredBy });
            if (referrer) {
                result.self = await getPaymentMethodsForUserLevel(referrer, 'self');
            }
        }

        // Level 1 users - direct referrals
        const levelOneUsers = await User.find({ referredBy: user.referralCode });
        for (const levelOneUser of levelOneUsers) {
            const paymentMethods = await getPaymentMethodsForUserLevel(levelOneUser, 1);
            result.levelOne.push({
                userId: levelOneUser.userId,
                userName: levelOneUser.name,
                paymentMethods: paymentMethods
            });
        }

        // Level 2 users - referrals of referrals
        if (levelOneUsers.length > 0) {
            const levelOneReferralCodes = levelOneUsers.map(u => u.referralCode);
            const levelTwoUsers = await User.find({
                referredBy: { $in: levelOneReferralCodes }
            });

            for (const levelTwoUser of levelTwoUsers) {
                const paymentMethods = await getPaymentMethodsForUserLevel(levelTwoUser, 2);
                result.levelTwo.push({
                    userId: levelTwoUser.userId,
                    userName: levelTwoUser.name,
                    referredBy: levelTwoUser.referredBy,
                    paymentMethods: paymentMethods
                });
            }

            // Level 3 users
            if (levelTwoUsers.length > 0) {
                const levelTwoReferralCodes = levelTwoUsers.map(u => u.referralCode);
                const levelThreeUsers = await User.find({
                    referredBy: { $in: levelTwoReferralCodes }
                });

                for (const levelThreeUser of levelThreeUsers) {
                    const paymentMethods = await getPaymentMethodsForUserLevel(levelThreeUser, 3);
                    result.levelThree.push({
                        userId: levelThreeUser.userId,
                        userName: levelThreeUser.name,
                        referredBy: levelThreeUser.referredBy,
                        paymentMethods: paymentMethods
                    });
                }
            }
        }

        return result;

    } catch (error) {
        console.error("Error getting payment methods for all levels:", error);
        throw error;
    }
};

// Get payment methods for specific levels only
const getPaymentMethodsByLevel = async (user, levels = [1, 2, 3]) => {
    const result = {};

    for (const level of levels) {
        result[`level${level}`] = [];
    }

    // Level 1
    if (levels.includes(1)) {
        const levelOneUsers = await User.find({ referredBy: user.referralCode });
        for (const levelOneUser of levelOneUsers) {
            const paymentMethods = await getPaymentMethodsForUserLevel(levelOneUser, 1);
            result.level1.push({
                userId: levelOneUser.userId,
                userName: levelOneUser.name,
                paymentMethods: paymentMethods
            });
        }
    }

    // Level 2
    if (levels.includes(2)) {
        const levelOneUsers = await User.find({ referredBy: user.referralCode });
        if (levelOneUsers.length > 0) {
            const levelOneReferralCodes = levelOneUsers.map(u => u.referralCode);
            const levelTwoUsers = await User.find({
                referredBy: { $in: levelOneReferralCodes }
            });

            for (const levelTwoUser of levelTwoUsers) {
                const paymentMethods = await getPaymentMethodsForUserLevel(levelTwoUser, 2);
                result.level2.push({
                    userId: levelTwoUser.userId,
                    userName: levelTwoUser.name,
                    paymentMethods: paymentMethods
                });
            }
        }
    }

    // Level 3
    if (levels.includes(3)) {
        const levelOneUsers = await User.find({ referredBy: user.referralCode });
        if (levelOneUsers.length > 0) {
            const levelOneReferralCodes = levelOneUsers.map(u => u.referralCode);
            const levelTwoUsers = await User.find({
                referredBy: { $in: levelOneReferralCodes }
            });

            if (levelTwoUsers.length > 0) {
                const levelTwoReferralCodes = levelTwoUsers.map(u => u.referralCode);
                const levelThreeUsers = await User.find({
                    referredBy: { $in: levelTwoReferralCodes }
                });

                for (const levelThreeUser of levelThreeUsers) {
                    const paymentMethods = await getPaymentMethodsForUserLevel(levelThreeUser, 3);
                    result.level3.push({
                        userId: levelThreeUser.userId,
                        userName: levelThreeUser.name,
                        paymentMethods: paymentMethods
                    });
                }
            }
        }
    }

    return result;
};

// Get available gateways for user
const getAvailableGatewaysForUser = async (userId) => {
    try {
        const user = await User.findOne({ userId });
        if (!user) {
            throw new Error('User not found');
        }

        const paymentMethods = await getPaymentMethodsForAllLevels(user);
        
        return {
            success: true,
            user: {
                userId: user.userId,
                name: user.name,
                referralCode: user.referralCode
            },
            paymentMethods
        };
    } catch (error) {
        console.error("Error in getAvailableGatewaysForUser:", error);
        return {
            success: false,
            message: error.message
        };
    }
};

module.exports = {
    getPaymentMethodsForUserLevel,
    getUserWithReferralLevels,
    getReferralOwner,
    getPaymentMethodsForAllLevels,
    getPaymentMethodsByLevel,
    getAvailableGatewaysForUser
};