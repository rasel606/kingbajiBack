// // const User = require('../Models/User');
// // const ReferralBonus = require('../Models/ReferralBonus');

// // class AuthService {
  
// //   async checkExistingUser(userId, phone, email) {
// //     const searchConditions = [
// //       { userId: userId.toLowerCase() },
// //       { "phone.number": phone }
// //     ];

// //     if (email && email.trim() !== '') {
// //       searchConditions.push({ email: email.toLowerCase().trim() });
// //     }

// //     const existingUser = await User.findOne({
// //       $or: searchConditions
// //     });

// //     if (!existingUser) {
// //       return { exists: false };
// //     }

// //     let conflictField = '';
// //     let message = 'User already exists';
    
// //     if (existingUser.userId === userId.toLowerCase()) {
// //       conflictField = 'User ID';
// //       message = 'User ID already exists';
// //     } else if (existingUser.phone.some(p => p.number === phone)) {
// //       conflictField = 'phone number';
// //       message = 'Phone number already registered';
// //     } else if (email && existingUser.email === email.toLowerCase().trim()) {
// //       conflictField = 'email';
// //       message = 'Email already registered';
// //     }

// //     return {
// //       exists: true,
// //       field: conflictField,
// //       message: message
// //     };
// //   }

// //   async findUserByIdentifier(identifier) {
// //     if (!identifier) return null;

// //     const user = await User.findOne({
// //       $or: [
// //         { userId: identifier.toLowerCase() },
// //         { email: identifier.toLowerCase() },
// //         { "phone.number": identifier }
// //       ]
// //     });

// //     return user;
// //   }

// //   async handleReferralSystem(newUser, referredByCode) {
// //     try {
// //       const referrer = await User.findOne({ referralCode: referredByCode });
// //       if (!referrer) {
// //         console.log("⚠️ Referrer not found with code:", referredByCode);
// //         return;
// //       }

// //       // Update new user's referredBy field
// //       newUser.referredBy = referrer.userId;
// //       await newUser.save();

// //       // Level 1 referral
// //       await referrer.addReferral(newUser.userId, 1);
// //       await new ReferralBonus({
// //         userId: referrer.userId,
// //         referredUser: newUser.userId,
// //         level: 1
// //       }).save();

// //       // Level 2 referral
// //       if (referrer.referredBy) {
// //         const level2Ref = await User.findOne({ userId: referrer.referredBy });
// //         if (level2Ref) {
// //           await level2Ref.addReferral(newUser.userId, 2);
// //           await new ReferralBonus({
// //             userId: level2Ref.userId,
// //             referredUser: newUser.userId,
// //             level: 2
// //           }).save();

// //           // Level 3 referral
// //           if (level2Ref.referredBy) {
// //             const level3Ref = await User.findOne({ userId: level2Ref.referredBy });
// //             if (level3Ref) {
// //               await level3Ref.addReferral(newUser.userId, 3);
// //               await new ReferralBonus({
// //                 userId: level3Ref.userId,
// //                 referredUser: newUser.userId,
// //                 level: 3
// //               }).save();
// //             }
// //           }
// //         }
// //       }

// //       console.log("✅ Referral system processed successfully");
// //     } catch (error) {
// //       console.error("❌ Referral system error:", error);
// //     }
// //   }
// // }

// // module.exports = new AuthService();

// const User = require('../Models/User');
// const ReferralBonus = require('../Models/ReferralBonus');

// class AuthService {
  
//   async checkExistingUser(userId, phone, email) {
//     const searchConditions = [
//       { userId: userId.toLowerCase() },
//       { "phone.number": phone }
//     ];

//     // Email দিলে শুধু তখনই check করবে
//     if (email && email.trim() !== '') {
//       searchConditions.push({ email: email.toLowerCase().trim() });
//     }

//     const existingUser = await User.findOne({
//       $or: searchConditions
//     });

//     if (!existingUser) {
//       return { exists: false };
//     }

//     let conflictField = '';
//     let message = 'ইউজার Already exists';
    
//     if (existingUser.userId === userId.toLowerCase()) {
//       conflictField = 'User ID';
//       message = 'এই User ID Already registered';
//     } else if (existingUser.phone.some(p => p.number === phone)) {
//       conflictField = 'মোবাইল নম্বর';
//       message = 'এই মোবাইল নম্বর Already registered';
//     } else if (email && existingUser.email === email.toLowerCase().trim()) {
//       conflictField = 'ইমেইল';
//       message = 'এই ইমেইল Already registered';
//     }

//     return {
//       exists: true,
//       field: conflictField,
//       message: message
//     };
//   }

//   async findUserByIdentifier(identifier) {
//     if (!identifier) return null;

//     const user = await User.findOne({
//       $or: [
//         { userId: identifier.toLowerCase() },
//         { email: identifier.toLowerCase() },
//         { "phone.number": identifier }
//       ]
//     });

//     return user;
//   }

//   async handleReferralSystem(newUser, referredByCode) {
//     try {
//       const referrer = await User.findOne({ referralCode: referredByCode });
//       if (!referrer) {
//         console.log("⚠️ রেফারার খুঁজে পাওয়া যায়নি:", referredByCode);
//         return;
//       }

//       // Update new user's referredBy field
//       newUser.referredBy = referrer.referralCode;
//       await newUser.save();

//       // Level 1 referral
//       await referrer.addReferral(newUser.userId, 1);
//       await new ReferralBonus({
//         userId: referrer.userId,
//         referredUser: newUser.userId,
//         referredBy: referrer.referralCode,
//         level: 1
//       }).save();

//       // Level 2 referral
//       if (referrer.referredBy) {
//         const level2Ref = await User.findOne({ referredBy: referrer.referralCode });
//         if (level2Ref) {
//           await level2Ref.addReferral(newUser.userId, 2);
//           await new ReferralBonus({
//             userId: level2Ref.userId,
//             referredUser: newUser.userId,
//             referredBy: referrer.referralCode,
//             level: 2
//           }).save();

//           // Level 3 referral
//           if (level2Ref.referredBy) {
//             const level3Ref = await User.findOne({ referredBy: referrer.referralCode });
//             if (level3Ref) {
//               await level3Ref.addReferral(newUser.userId, 3);
//               await new ReferralBonus({
//                 userId: level3Ref.userId,
//                 referredUser: newUser.userId,
//                 referredBy: referrer.referralCode,
//                 level: 3
//               }).save();
//             }
//           }
//         }
//       }

//       console.log("✅ রেফারেল সিস্টেম সফলভাবে কাজ করেছে");
//     } catch (error) {
//       console.error("❌ রেফারেল সিস্টেমে সমস্যা:", error);
//     }
//   }
// }

// module.exports = new AuthService();


// src/Services/AuthService.js
const User = require('../Models/User');
const ReferralBonus = require('../Models/ReferralBonus');

class AuthService {
  
  async checkExistingUser(userId, phone, email) {
    const searchConditions = [
      { userId: userId.toLowerCase() },
      { "phone.number": phone }
    ];

    // Email দিলে শুধু তখনই check করবে
    if (email && email.trim() !== '') {
      searchConditions.push({ email: email.toLowerCase().trim() });
    }

    const existingUser = await User.findOne({
      $or: searchConditions
    });

    if (!existingUser) {
      return { exists: false };
    }

    let conflictField = '';
    let message = 'ইউজার Already exists';
    
    if (existingUser.userId === userId.toLowerCase()) {
      conflictField = 'User ID';
      message = 'এই User ID Already registered';
    } else if (existingUser.phone.some(p => p.number === phone)) {
      conflictField = 'মোবাইল নম্বর';
      message = 'এই মোবাইল নম্বর Already registered';
    } else if (email && existingUser.email === email.toLowerCase().trim()) {
      conflictField = 'ইমেইল';
      message = 'এই ইমেইল Already registered';
    }

    return {
      exists: true,
      field: conflictField,
      message: message
    };
  }

  async findUserByIdentifier(identifier) {
    if (!identifier) return null;

    const user = await User.findOne({
      $or: [
        { userId: identifier.toLowerCase() },
        { email: identifier.toLowerCase() },
        { "phone.number": identifier }
      ]
    });

    return user;
  }

  async handleReferralSystem(newUser, referredByCode) {
    try {
      const referrer = await User.findOne({ referralCode: referredByCode });
      if (!referrer) {
        console.log("⚠️ রেফারার খুঁজে পাওয়া যায়নি:", referredByCode);
        return;
      }

      // Update new user's referredBy field
      newUser.referredBy = referrer.referralCode;
      await newUser.save();

      // Level 1 referral
      await referrer.addReferral(newUser.userId, 1);
      await new ReferralBonus({
        userId: referrer.userId,
        referredUser: newUser.userId,
        referredBy: referrer.referralCode,
        level: 1
      }).save();

      // Level 2 referral
      if (referrer.referredBy) {
        const level2Ref = await User.findOne({ referredBy: referrer.referralCode });
        if (level2Ref) {
          await level2Ref.addReferral(newUser.userId, 2);
          await new ReferralBonus({
            userId: level2Ref.userId,
            referredUser: newUser.userId,
            referredBy: referrer.referralCode,
            level: 2
          }).save();

          // Level 3 referral
          if (level2Ref.referredBy) {
            const level3Ref = await User.findOne({ referredBy: referrer.referralCode });
            if (level3Ref) {
              await level3Ref.addReferral(newUser.userId, 3);
              await new ReferralBonus({
                userId: level3Ref.userId,
                referredUser: newUser.userId,
                referredBy: referrer.referralCode,
                level: 3
              }).save();
            }
          }
        }
      }

      console.log("✅ রেফারেল সিস্টেম সফলভাবে কাজ করেছে");
    } catch (error) {
      console.error("❌ রেফারেল সিস্টেমে সমস্যা:", error);
    }
  }
}

module.exports = new AuthService();