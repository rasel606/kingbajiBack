const PaymentGateWayTable = require('../models/PaymentGateWayTable');
const User = require('../models/User');
const SubAdmin = require('../models/SubAdminModel');
const AffiliateModel = require('../models/AffiliateModel');
const AdminModel = require('../models/AdminModel');

class HierarchicalGatewayController {
    
    // ✅ এডমিনের নিজস্ব গেটওয়ে দেখুন
    static async getAdminGateways(req, res) {
        try {
            const admin = req.user;

            // এডমিনের নিজস্ব গেটওয়ে (referredBy: "admin" ব্যবহার করে)
            const adminGateways = await PaymentGateWayTable.find({ 
                referredBy: "admin" 
            });

            // এডমিনের অধীনস্থ সাব-এডমিনদের গেটওয়ে
            const subAdmins = await SubAdmin.find();
            const subAdminGateways = await Promise.all(
                subAdmins.map(async (subAdmin) => {
                    const gateways = await PaymentGateWayTable.find({ 
                        referredBy: subAdmin.referralCode 
                    });
                    return {
                        subAdminId: subAdmin.SubAdminId,
                        name: subAdmin.name,
                        referralCode: subAdmin.referralCode,
                        gateways: gateways,
                        totalGateways: gateways.length
                    };
                })
            );

            // এডমিনের ডাইরেক্ট এফিলিয়েটদের গেটওয়ে
            const directAffiliates = await AffiliateModel.find({ 
                referredBy: null  // এডমিনের ডাইরেক্ট এফিলিয়েট
            });
            const directAffiliateGateways = await Promise.all(
                directAffiliates.map(async (affiliate) => {
                    const gateways = await PaymentGateWayTable.find({ 
                        referredBy: affiliate.referralCode 
                    });
                    return {
                        affiliateId: affiliate.userId,
                        name: `${affiliate.firstName} ${affiliate.lastName}`,
                        referralCode: affiliate.referralCode,
                        gateways: gateways,
                        totalGateways: gateways.length
                    };
                })
            );

            // এডমিনের ডাইরেক্ট ইউজারদের গেটওয়ে
            const directUsers = await User.find({ 
                referredBy: null  // এডমিনের ডাইরেক্ট ইউজার
            });
            const directUserGateways = await Promise.all(
                directUsers.map(async (user) => {
                    const gateways = await PaymentGateWayTable.find({ 
                        referredBy: user.referralCode 
                    });
                    return {
                        userId: user.userId,
                        name: user.name,
                        referralCode: user.referralCode,
                        gateways: gateways,
                        totalGateways: gateways.length
                    };
                })
            );

            res.json({
                success: true,
                data: {
                    admin: {
                        adminId: admin.adminCode,
                        name: admin.firstName,
                        email: admin.email,
                        hasReferralCode: !!admin.referralCode
                    },
                    adminOwnGateways: {
                        gateways: adminGateways,
                        total: adminGateways.length
                    },
                    hierarchy: {
                        subAdmins: subAdminGateways,
                        directAffiliates: directAffiliateGateways,
                        directUsers: directUserGateways
                    },
                    summary: {
                        totalAdminGateways: adminGateways.length,
                        totalSubAdmins: subAdmins.length,
                        totalDirectAffiliates: directAffiliates.length,
                        totalDirectUsers: directUsers.length,
                        totalAllGateways: 
                            adminGateways.length +
                            subAdminGateways.reduce((sum, item) => sum + item.totalGateways, 0) +
                            directAffiliateGateways.reduce((sum, item) => sum + item.totalGateways, 0) +
                            directUserGateways.reduce((sum, item) => sum + item.totalGateways, 0)
                    }
                }
            });

        } catch (error) {
            console.error('Get admin gateways error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching admin gateways'
            });
        }
    }

    // ✅ এডমিনের জন্য নতুন গেটওয়ে তৈরি করুন
    static async createAdminGateway(req, res) {
        try {
            const admin = req.user;
            const {
                gatewayName,
                gatewayType,
                accountName,
                accountNumber,
                branch,
                routingNumber,
                operator,
                minAmount,
                maxAmount,
                startTime,
                endTime,
                processingFee,
                priority
            } = req.body;

            // ভ্যালিডেশন
            if (!gatewayName || !gatewayType || !accountName || !accountNumber) {
                return res.status(400).json({
                    success: false,
                    message: 'Required fields: gatewayName, gatewayType, accountName, accountNumber'
                });
            }

            // টাইম কনভার্সন
            const startTotalMinutes = startTime ? this.timeToMinutes(startTime) : 0;
            const endTotalMinutes = endTime ? this.timeToMinutes(endTime) : 1440;

            const newGateway = new PaymentGateWayTable({
                gatewayName,
                gatewayType,
                accountName,
                accountNumber,
                branch,
                routingNumber,
                operator,
                referredBy: "admin", // এডমিনের গেটওয়েতে referredBy: "admin" ব্যবহার করা হয়
                minAmount: minAmount || 0,
                maxAmount: maxAmount || 100000,
                startTotalMinutes,
                endTotalMinutes,
                processingFee: processingFee || 0,
                priority: priority || 1,
                is_active: true,
                adminId: admin.adminCode // এডমিন আইডি স্টোর করুন
            });

            await newGateway.save();

            res.status(201).json({
                success: true,
                message: 'Admin gateway created successfully',
                data: { gateway: newGateway }
            });

        } catch (error) {
            console.error('Create admin gateway error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while creating admin gateway'
            });
        }
    }

    // ✅ এডমিনের গেটওয়ে আপডেট করুন
    static async updateAdminGateway(req, res) {
        try {
            const admin = req.user;
            const { gatewayId } = req.params;
            const updateData = req.body;

            // টাইম কনভার্সন যদি থাকে
            if (updateData.startTime) {
                updateData.startTotalMinutes = this.timeToMinutes(updateData.startTime);
                delete updateData.startTime;
            }

            if (updateData.endTime) {
                updateData.endTotalMinutes = this.timeToMinutes(updateData.endTime);
                delete updateData.endTime;
            }

            // শুধুমাত্র এডমিনের গেটওয়ে আপডেট করতে দিন
            const gateway = await PaymentGateWayTable.findOne({ 
                _id: gatewayId, 
                referredBy: "admin" 
            });

            if (!gateway) {
                return res.status(404).json({
                    success: false,
                    message: 'Admin gateway not found'
                });
            }

            // আপডেট করুন
            Object.keys(updateData).forEach(key => {
                gateway[key] = updateData[key];
            });

            await gateway.save();

            res.json({
                success: true,
                message: 'Admin gateway updated successfully',
                data: { gateway }
            });

        } catch (error) {
            console.error('Update admin gateway error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while updating admin gateway'
            });
        }
    }

    // ✅ এডমিনের গেটওয়ে ডিলিট করুন
    static async deleteAdminGateway(req, res) {
        try {
            const admin = req.user;
            const { gatewayId } = req.params;

            const gateway = await PaymentGateWayTable.findOneAndDelete({ 
                _id: gatewayId, 
                referredBy: "admin" 
            });

            if (!gateway) {
                return res.status(404).json({
                    success: false,
                    message: 'Admin gateway not found'
                });
            }

            res.json({
                success: true,
                message: 'Admin gateway deleted successfully'
            });

        } catch (error) {
            console.error('Delete admin gateway error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while deleting admin gateway'
            });
        }
    }

    // ✅ সাব-এডমিনের সমস্ত গেটওয়ে দেখুন (নিজের + এফিলিয়েট + ইউজার)
    static async getSubAdminAllGateways(req, res) {
        try {
            const subAdmin = req.user;

            // সাব-এডমিনের নিজের গেটওয়ে
            const ownGateways = await PaymentGateWayTable.find({ 
                referredBy: subAdmin.referralCode 
            });

            // সাব-এডমিনের এফিলিয়েটদের গেটওয়ে
            const affiliates = await AffiliateModel.find({ 
                referredBy: subAdmin.referralCode 
            });
            const affiliateGateways = await Promise.all(
                affiliates.map(async (affiliate) => {
                    const gateways = await PaymentGateWayTable.find({ 
                        referredBy: affiliate.referralCode 
                    });

                    // এফিলিয়েটের ইউজারদের গেটওয়ে
                    const affiliateUsers = await User.find({ 
                        referredBy: affiliate.referralCode 
                    });
                    const userGateways = await Promise.all(
                        affiliateUsers.map(async (user) => {
                            const userGws = await PaymentGateWayTable.find({ 
                                referredBy: user.referralCode 
                            });

                            // ইউজারের সাব-ইউজারদের গেটওয়ে (লেভেল 2)
                            const subUsers = await User.find({ 
                                referredBy: user.referralCode 
                            });
                            const subUserGateways = await Promise.all(
                                subUsers.map(async (subUser) => {
                                    const subUserGws = await PaymentGateWayTable.find({ 
                                        referredBy: subUser.referralCode 
                                    });

                                    // সাব-ইউজারদের সাব-ইউজারদের গেটওয়ে (লেভেল 3)
                                    const level3Users = await User.find({ 
                                        referredBy: subUser.referralCode 
                                    });
                                    const level3Gateways = await Promise.all(
                                        level3Users.map(async (level3User) => {
                                            const level3Gws = await PaymentGateWayTable.find({ 
                                                referredBy: level3User.referralCode 
                                            });
                                            return {
                                                userId: level3User.userId,
                                                name: level3User.name,
                                                gateways: level3Gws,
                                                level: 3
                                            };
                                        })
                                    );

                                    return {
                                        userId: subUser.userId,
                                        name: subUser.name,
                                        gateways: subUserGws,
                                        level: 2,
                                        level3Users: level3Gateways
                                    };
                                })
                            );

                            return {
                                userId: user.userId,
                                name: user.name,
                                gateways: userGws,
                                level: 1,
                                subUsers: subUserGateways
                            };
                        })
                    );

                    return {
                        affiliateId: affiliate.userId,
                        name: `${affiliate.firstName} ${affiliate.lastName}`,
                        gateways: gateways,
                        users: userGateways
                    };
                })
            );

            // সাব-এডমিনের ডাইরেক্ট ইউজারদের গেটওয়ে
            const directUsers = await User.find({ 
                referredBy: subAdmin.referralCode 
            });
            const directUserGateways = await Promise.all(
                directUsers.map(async (user) => {
                    const gateways = await PaymentGateWayTable.find({ 
                        referredBy: user.referralCode 
                    });

                    // ডাইরেক্ট ইউজারদের সাব-ইউজারদের গেটওয়ে
                    const subUsers = await User.find({ 
                        referredBy: user.referralCode 
                    });
                    const subUserGateways = await Promise.all(
                        subUsers.map(async (subUser) => {
                            const subUserGws = await PaymentGateWayTable.find({ 
                                referredBy: subUser.referralCode 
                            });

                            // সাব-ইউজারদের সাব-ইউজারদের গেটওয়ে
                            const level3Users = await User.find({ 
                                referredBy: subUser.referralCode 
                            });
                            const level3Gateways = await Promise.all(
                                level3Users.map(async (level3User) => {
                                    const level3Gws = await PaymentGateWayTable.find({ 
                                        referredBy: level3User.referralCode 
                                    });
                                    return {
                                        userId: level3User.userId,
                                        name: level3User.name,
                                        gateways: level3Gws,
                                        level: 3
                                    };
                                })
                            );

                            return {
                                userId: subUser.userId,
                                name: subUser.name,
                                gateways: subUserGws,
                                level: 2,
                                level3Users: level3Gateways
                            };
                        })
                    );

                    return {
                        userId: user.userId,
                        name: user.name,
                        gateways: gateways,
                        level: 1,
                        subUsers: subUserGateways
                    };
                })
            );

            res.json({
                success: true,
                data: {
                    subAdmin: {
                        subAdminId: subAdmin.SubAdminId,
                        name: subAdmin.name,
                        referralCode: subAdmin.referralCode
                    },
                    ownGateways: {
                        gateways: ownGateways,
                        total: ownGateways.length
                    },
                    affiliates: affiliateGateways,
                    directUsers: directUserGateways,
                    summary: {
                        totalOwnGateways: ownGateways.length,
                        totalAffiliates: affiliates.length,
                        totalDirectUsers: directUsers.length,
                        totalAffiliateUsers: affiliateGateways.reduce((sum, aff) => sum + aff.users.length, 0),
                        totalAllGateways: 
                            ownGateways.length +
                            affiliateGateways.reduce((sum, aff) => sum + aff.gateways.length, 0) +
                            directUserGateways.reduce((sum, user) => sum + user.gateways.length, 0) +
                            affiliateGateways.reduce((sum, aff) => 
                                sum + aff.users.reduce((userSum, user) => 
                                    userSum + user.gateways.length + 
                                    user.subUsers.reduce((subSum, sub) => 
                                        subSum + sub.gateways.length + 
                                        sub.level3Users.reduce((l3Sum, l3) => l3Sum + l3.gateways.length, 0)
                                    , 0)
                                , 0)
                            , 0) +
                            directUserGateways.reduce((sum, user) => 
                                sum + user.subUsers.reduce((subSum, sub) => 
                                    subSum + sub.gateways.length + 
                                    sub.level3Users.reduce((l3Sum, l3) => l3Sum + l3.gateways.length, 0)
                                , 0)
                            , 0)
                    }
                }
            });

        } catch (error) {
            console.error('Get subadmin all gateways error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching subadmin gateways'
            });
        }
    }

    // ✅ এফিলিয়েটের সমস্ত গেটওয়ে দেখুন (নিজের + ইউজার + সাব-ইউজার)
    static async getAffiliateAllGateways(req, res) {
        try {
            const affiliate = req.user;

            // এফিলিয়েটের নিজের গেটওয়ে
            const ownGateways = await PaymentGateWayTable.find({ 
                referredBy: affiliate.referralCode 
            });

            // এফিলিয়েটের ইউজারদের গেটওয়ে
            const users = await User.find({ 
                referredBy: affiliate.referralCode 
            });
            const userGateways = await Promise.all(
                users.map(async (user) => {
                    const gateways = await PaymentGateWayTable.find({ 
                        referredBy: user.referralCode 
                    });

                    // ইউজারের সাব-ইউজারদের গেটওয়ে (লেভেল 2)
                    const subUsers = await User.find({ 
                        referredBy: user.referralCode 
                    });
                    const subUserGateways = await Promise.all(
                        subUsers.map(async (subUser) => {
                            const subUserGws = await PaymentGateWayTable.find({ 
                                referredBy: subUser.referralCode 
                            });

                            // সাব-ইউজারদের সাব-ইউজারদের গেটওয়ে (লেভেল 3)
                            const level3Users = await User.find({ 
                                referredBy: subUser.referralCode 
                            });
                            const level3Gateways = await Promise.all(
                                level3Users.map(async (level3User) => {
                                    const level3Gws = await PaymentGateWayTable.find({ 
                                        referredBy: level3User.referralCode 
                                    });
                                    return {
                                        userId: level3User.userId,
                                        name: level3User.name,
                                        gateways: level3Gws,
                                        level: 3
                                    };
                                })
                            );

                            return {
                                userId: subUser.userId,
                                name: subUser.name,
                                gateways: subUserGws,
                                level: 2,
                                level3Users: level3Gateways
                            };
                        })
                    );

                    return {
                        userId: user.userId,
                        name: user.name,
                        gateways: gateways,
                        level: 1,
                        subUsers: subUserGateways
                    };
                })
            );

            res.json({
                success: true,
                data: {
                    affiliate: {
                        affiliateId: affiliate.userId,
                        name: `${affiliate.firstName} ${affiliate.lastName}`,
                        referralCode: affiliate.referralCode
                    },
                    ownGateways: {
                        gateways: ownGateways,
                        total: ownGateways.length
                    },
                    users: userGateways,
                    summary: {
                        totalOwnGateways: ownGateways.length,
                        totalUsers: users.length,
                        totalSubUsers: userGateways.reduce((sum, user) => sum + user.subUsers.length, 0),
                        totalLevel3Users: userGateways.reduce((sum, user) => 
                            sum + user.subUsers.reduce((subSum, sub) => subSum + sub.level3Users.length, 0)
                        , 0),
                        totalAllGateways: 
                            ownGateways.length +
                            userGateways.reduce((sum, user) => 
                                sum + user.gateways.length + 
                                user.subUsers.reduce((subSum, sub) => 
                                    subSum + sub.gateways.length + 
                                    sub.level3Users.reduce((l3Sum, l3) => l3Sum + l3.gateways.length, 0)
                                , 0)
                            , 0)
                    }
                }
            });

        } catch (error) {
            console.error('Get affiliate all gateways error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching affiliate gateways'
            });
        }
    }

    // ✅ ইউজারের গেটওয়ে দেখুন (নিজের + সাব-ইউজার)
    static async getUserAllGateways(req, res) {
        try {
            // const user = req.user;
            const {userId} = req.query; // সম্পূর্ণ ইউজার অবজেক্ট পুনরুদ্ধার করুন
            const user = await User.findOne({userId: userId});

            // ইউজারের নিজের গেটওয়ে
            const ownGateways = await PaymentGateWayTable.find({ 
                referredBy: user.referredBy 
            });

            // ইউজারের সাব-ইউজারদের গেটওয়ে (লেভেল 2)
            const subUsers = await User.find({ 
                referredBy: user.referredBy 
            });
            const subUserGateways = await Promise.all(
                subUsers.map(async (subUser) => {
                    const subUserGws = await PaymentGateWayTable.find({ 
                        referredBy: subUser.referredBy 
                    });

                    // সাব-ইউজারদের সাব-ইউজারদের গেটওয়ে (লেভেল 3)
                    const level3Users = await User.find({ 
                        referredBy: subUser.referredBy 
                    });
                    const level3Gateways = await Promise.all(
                        level3Users.map(async (level3User) => {
                            const level3Gws = await PaymentGateWayTable.find({ 
                                referredBy: level3User.referredBy 
                            });
                            return {
                                userId: level3User.userId,
                                name: level3User.name,
                                gateways: level3Gws,
                                level: 3
                            };
                        })
                    );

                    return {
                        userId: subUser.userId,
                        name: subUser.name,
                        gateways: subUserGws,
                        level: 2,
                        level3Users: level3Gateways
                    };
                })
            );

            res.json({
                success: true,
                data: {
                    user: {
                        userId: user.userId,
                        name: user.name,
                        referralCode: user.referralCode
                    },
                    ownGateways: {
                        gateways: ownGateways,
                        total: ownGateways.length
                    },
                    subUsers: subUserGateways,
                    summary: {
                        totalOwnGateways: ownGateways.length,
                        totalSubUsers: subUsers.length,
                        totalLevel3Users: subUserGateways.reduce((sum, sub) => sum + sub.level3Users.length, 0),
                        totalAllGateways: 
                            ownGateways.length +
                            subUserGateways.reduce((sum, sub) => 
                                sum + sub.gateways.length + 
                                sub.level3Users.reduce((l3Sum, l3) => l3Sum + l3.gateways.length, 0)
                            , 0)
                    }
                }
            });

        } catch (error) {
            console.error('Get user all gateways error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching user gateways'
            });
        }
    }

    // ✅ ডিপোজিটের জন্য উপলব্ধ গেটওয়ে (এডমিন সহ ৩ লেভেল পর্যন্ত)
    static async getAvailableGatewaysForDeposit(req, res) {
        try {
            const user = req.user;
            const availableGateways = await this.getUplineGateways(user, 3);

            res.json({
                success: true,
                data: {
                    user: {
                        userId: user.userId,
                        name: user.name || `${user.firstName} ${user.lastName}`,
                        role: user.role
                    },
                    availableGateways
                }
            });

        } catch (error) {
            console.error('Get available gateways for deposit error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching available gateways'
            });
        }
    }

    // ✅ উপলাইন গেটওয়ে পাওয়ার হেল্পার মেথড (এডমিন সহ)
    static async getUplineGateways(user, maxLevel = 3) {
        const result = {
            admin: [],  // এডমিন গেটওয়ে
            level1: [], // ডাইরেক্ট রেফারার
            level2: [], // রেফারারের রেফারার
            level3: []  // লেভেল ৩ রেফারার
        };

        // এডমিন গেটওয়ে সবসময় উপলব্ধ
        result.admin = await this.getGatewaysByReferralCode("admin");

        let currentUser = user;
        let level = 1;

        // লেভেল ১: ডাইরেক্ট রেফারার
        if (currentUser.referredBy && level <= maxLevel) {
            const level1Gateways = await this.getGatewaysByReferralCode(currentUser.referredBy);
            result.level1 = level1Gateways;
            
            // লেভেল ২: রেফারারের রেফারার
            const level1User = await this.findUserByReferralCode(currentUser.referredBy);
            if (level1User && level1User.referredBy && level < maxLevel) {
                const level2Gateways = await this.getGatewaysByReferralCode(level1User.referredBy);
                result.level2 = level2Gateways;
                
                // লেভেল ৩: লেভেল ২ এর রেফারার
                const level2User = await this.findUserByReferralCode(level1User.referredBy);
                if (level2User && level2User.referredBy && level < maxLevel) {
                    const level3Gateways = await this.getGatewaysByReferralCode(level2User.referredBy);
                    result.level3 = level3Gateways;
                }
            }
        }

        return result;
    }

    // ✅ রেফারেল কোড দ্বারা গেটওয়ে পাওয়ার হেল্পার
    static async getGatewaysByReferralCode(referralCode) {
        return await PaymentGateWayTable.find({ 
            referredBy: referralCode,
            is_active: true 
        });
    }

    // ✅ রেফারেল কোড দ্বারা ইউজার খোঁজার হেল্পার
    static async findUserByReferralCode(referralCode) {
        if (referralCode === "admin") return null; // এডমিনের জন্য আলাদা হ্যান্ডেল

        let user = await User.findOne({ referralCode });
        if (user) return user;

        user = await AffiliateModel.findOne({ referralCode });
        if (user) return user;

        user = await SubAdmin.findOne({ referralCode });
        return user;
    }

    // ✅ টাইম টু মিনিট কনভার্সন হেল্পার
    static timeToMinutes(timeString) {
        if (!timeString) return 0;
        
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    }
}

module.exports = HierarchicalGatewayController;