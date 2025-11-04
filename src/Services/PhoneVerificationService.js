// // controllers/phoneVerificationController.js
// const PhoneVerification = require('../Models/PhoneVerification');
// const User = require('../Models/User');
// const { generateVerificationCode, generateExpiryTime } = require('../utils/generateCode');
// const { maskPhoneNumber, validatePhoneNumber } = require('../Healper/maskPhoneNumberHelper');
// const { sendSms }  = require('./sendSms');

// class PhoneVerificationService {
//  // Send verification code for new phone number
//   // Send verification code
//   async sendVerificationCode(req, res) {
//     try {
//       const { phone_number } = req.body;
//       const ipAddress = req.ip;

//       console.log(req.body);

//       // Validate phone number format
//       if (!validatePhoneNumber(phone_number)) {
//         return res.status(400).json({
//           success: false,
//           message: 'Invalid phone number format. Please use a valid Bangladeshi number.'
//         });
//       }

//       // Check if phone number is already verified by another user
//       const existingUser = await User.findOne({ 
//         phoneNumber: phone_number,
//         isPhoneVerified: true 
//       });

//       console.log("existingUser",existingUser);

//       if (existingUser && existingUser.userId.toString() !== req.user.userId.toString()) {
//         return res.status(409).json({
//           success: false,
//           message: 'This phone number is already registered with another account.'
//         });
//       }

//       // Generate verification code
//       const verificationCode = generateVerificationCode();
//       const expiresAt = generateExpiryTime(10); // 10 minutes expiry

//       // Create or update verification record
//       await PhoneVerification.findOneAndUpdate(
//         { phoneNumber: phone_number },
//         {
//           verificationCode,
//           expiresAt,
//           attempts: 0,
//           isUsed: false,
//           ipAddress
//         },
//         { upsert: true, new: true }
//       );

//       // Send SMS
//       const smsResult =await sendSms(maskPhoneNumber(phone_number), `Your verification code is ${verificationCode}`);
//       // if (!smsResult.success) {
//       //   return res.status(500).json({
//       //     success: false,
//       //     message: 'Failed to send verification code. Please try again.'
//       //   });
//       // }

//       res.json({
//         success: true,
//         message: 'Verification code sent successfully',
//         maskedPhoneNumber: maskPhoneNumber(phone_number),
//         expiresIn: '10 minutes'
//       });

//     } catch (error) {
//       console.error('Send verification code error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Internal server error'
//       });
//     }
//   }

//   // Verify code
//   async verifyCode(req, res) {
//     try {
//       const { phone_number, verification_code } = req.body;

//       // Find valid verification code
//       const verification = await PhoneVerification.findValidCode(phone_number, verification_code);

//       if (!verification) {
//         // Increment attempts if verification exists but code is wrong
//         await PhoneVerification.findOneAndUpdate(
//           { phoneNumber: phone_number },
//           { $inc: { attempts: 1 } }
//         );

//         return res.status(400).json({
//           success: false,
//           message: 'Invalid or expired verification code'
//         });
//       }

//       // Mark code as used
//       verification.isUsed = true;
//       await verification.save();

//       // Update user's phone number and mark as verified
//       const user = await User.findByIdAndUpdate(
//         req.user.userId,
//         { 
//           phoneNumber: phone_number,
//           isPhoneVerified: true 
//         },
//         { new: true }
//       );

//       res.json({
//         success: true,
//         message: 'Phone number verified successfully',
//         user: {
//           id: user._id,
//           username: user.username,
//           phoneNumber: user.phoneNumber,
//           isPhoneVerified: user.isPhoneVerified
//         }
//       });

//     } catch (error) {
//       console.error('Verify code error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Internal server error'
//       });
//     }
//   }

//   // Resend verification code
//   async resendVerificationCode(req, res) {
//     try {
//       const { phone_number } = req.body;
//       const ipAddress = req.ip;

//       // Check rate limiting (prevent spam)
//       const recentAttempts = await PhoneVerification.countDocuments({
//         phoneNumber: phone_number,
//         createdAt: { $gt: new Date(Date.now() - 2 * 60 * 1000) } // Last 2 minutes
//       });

//       if (recentAttempts >= 3) {
//         return res.status(429).json({
//           success: false,
//           message: 'Too many attempts. Please wait before requesting a new code.'
//         });
//       }

//       // Generate new code
//       const verificationCode = generateVerificationCode();
//       const expiresAt = generateExpiryTime(10);

//       await PhoneVerification.findOneAndUpdate(
//         { phoneNumber: phone_number },
//         {
//           verificationCode,
//           expiresAt,
//           attempts: 0,
//           isUsed: false,
//           ipAddress
//         },
//         { upsert: true, new: true }
//       );

//       // Send SMS
//       const smsResult = await sendSms(maskPhoneNumber(phone_number), `Your verification code is ${verificationCode}`);

//       res.json({
//         success: true,
//         message: 'Verification code sent again',
//         maskedPhoneNumber: maskPhoneNumber(phone_number)
//       });

//     } catch (error) {
//       console.error('Resend code error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to resend verification code'
//       });
//     }
//   }


//   // Get user's phone numbers
//   async getPhones(req, res) {
//     try {
//       const userId = req.user.userId;
      
//       const user = await User.findOne({ userId }).select('phone name userId');
//       if (!user) {
//         return res.status(404).json({
//           success: false,
//           message: 'User not found'
//         });
//       }

//       res.json({
//         success: true,
//         phones: user.phone,
//         hasVerifiedPhone: user.phone.some(p => p.verified)
//       });

//     } catch (error) {
//       console.error('Get phones error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Internal server error'
//       });
//     }
//   }

//   // Set default phone
//   async setDefaultPhone(req, res) {
//     try {
//       const { phone_number } = req.body;
//       const userId = req.user.userId;

//       const user = await User.findOne({ userId });
//       if (!user) {
//         return res.status(404).json({
//           success: false,
//           message: 'User not found'
//         });
//       }

//       const phone = user.phone.find(p => p.number === phone_number);
//       if (!phone) {
//         return res.status(404).json({
//           success: false,
//           message: 'Phone number not found'
//         });
//       }

//       if (!phone.verified) {
//         return res.status(400).json({
//           success: false,
//           message: 'Only verified phones can be set as default'
//         });
//       }

//       await user.setDefaultPhone(phone_number);

//       res.json({
//         success: true,
//         message: 'Default phone updated successfully',
//         phones: user.phone
//       });

//     } catch (error) {
//       console.error('Set default phone error:', error);
//       res.status(500).json({
//         success: false,
//         message: error.message || 'Internal server error'
//       });
//     }
//   }

//   // Remove phone number
//   async removePhone(req, res) {
//     try {
//       const { phone_number } = req.body;
//       const userId = req.user.userId;

//       const user = await User.findOne({ userId });
//       if (!user) {
//         return res.status(404).json({
//           success: false,
//           message: 'User not found'
//         });
//       }

//       // Check if this is the only verified phone
//       const verifiedPhones = user.phone.filter(p => p.verified);
//       const phoneToRemove = user.phone.find(p => p.number === phone_number);
      
//       if (verifiedPhones.length === 1 && phoneToRemove && phoneToRemove.verified) {
//         return res.status(400).json({
//           success: false,
//           message: 'Cannot remove the only verified phone number'
//         });
//       }

//       await user.removePhone(phone_number);

//       // Also remove any verification records for this phone
//       await PhoneVerification.deleteMany({
//         userId,
//         phoneNumber: { $regex: phone_number }
//       });

//       res.json({
//         success: true,
//         message: 'Phone number removed successfully',
//         phones: user.phone
//       });

//     } catch (error) {
//       console.error('Remove phone error:', error);
//       res.status(500).json({
//         success: false,
//         message: error.message || 'Internal server error'
//       });
//     }
//   }
// }

// module.exports = new PhoneVerificationService();


// controllers/phoneVerificationController.js
const PhoneVerification = require('../Models/PhoneVerification');
const User = require('../Models/User');
const { generateVerificationCode, generateExpiryTime } = require('../utils/generateCode');
const { maskPhoneNumber, validatePhoneNumber } = require('../Healper/maskPhoneNumberHelper');
const { sendSms }  = require('./sendSms');

class PhoneVerificationService {
 // Send verification code for new phone number
  // Send verification code
  async sendVerificationCode(req, res) {
    try {
      const { phone_number } = req.body;
      const ipAddress = req.ip;

      console.log(req.body);

      // Validate phone number format
      if (!validatePhoneNumber(phone_number)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid phone number format. Please use a valid Bangladeshi number.'
        });
      }

      // Check if phone number is already verified by another user
      const existingUser = await User.findOne({ 
        phoneNumber: phone_number,
        isPhoneVerified: true 
      });

      console.log("existingUser",existingUser);

      if (existingUser && existingUser.userId.toString() !== req.user.userId.toString()) {
        return res.status(409).json({
          success: false,
          message: 'This phone number is already registered with another account.'
        });
      }

      // Generate verification code
      const verificationCode = generateVerificationCode();
      const expiresAt = generateExpiryTime(10); // 10 minutes expiry

      // Create or update verification record
      await PhoneVerification.findOneAndUpdate(
        { phoneNumber: phone_number },
        {
          verificationCode,
          expiresAt,
          attempts: 0,
          isUsed: false,
          ipAddress
        },
        { upsert: true, new: true }
      );

      // Send SMS
      const smsResult =await sendSms(maskPhoneNumber(phone_number), `Your verification code is ${verificationCode}`);
      // if (!smsResult.success) {
      //   return res.status(500).json({
      //     success: false,
      //     message: 'Failed to send verification code. Please try again.'
      //   });
      // }

      res.json({
        success: true,
        message: 'Verification code sent successfully',
        maskedPhoneNumber: maskPhoneNumber(phone_number),
        expiresIn: '10 minutes'
      });

    } catch (error) {
      console.error('Send verification code error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Verify code
  async verifyCode(req, res) {
    try {
      const { phone_number, verification_code } = req.body;

      // Find valid verification code
      const verification = await PhoneVerification.findValidCode(phone_number, verification_code);

      if (!verification) {
        // Increment attempts if verification exists but code is wrong
        await PhoneVerification.findOneAndUpdate(
          { phoneNumber: phone_number },
          { $inc: { attempts: 1 } }
        );

        return res.status(400).json({
          success: false,
          message: 'Invalid or expired verification code'
        });
      }

      // Mark code as used
      verification.isUsed = true;
      await verification.save();

      // Update user's phone number and mark as verified
      const user = await User.findByIdAndUpdate(
        req.user.userId,
        { 
          phoneNumber: phone_number,
          isPhoneVerified: true 
        },
        { new: true }
      );

      res.json({
        success: true,
        message: 'Phone number verified successfully',
        user: {
          id: user._id,
          username: user.username,
          phoneNumber: user.phoneNumber,
          isPhoneVerified: user.isPhoneVerified
        }
      });

    } catch (error) {
      console.error('Verify code error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Resend verification code
  async resendVerificationCode(req, res) {
    try {
      const { phone_number } = req.body;
      const ipAddress = req.ip;

      // Check rate limiting (prevent spam)
      const recentAttempts = await PhoneVerification.countDocuments({
        phoneNumber: phone_number,
        createdAt: { $gt: new Date(Date.now() - 2 * 60 * 1000) } // Last 2 minutes
      });

      if (recentAttempts >= 3) {
        return res.status(429).json({
          success: false,
          message: 'Too many attempts. Please wait before requesting a new code.'
        });
      }

      // Generate new code
      const verificationCode = generateVerificationCode();
      const expiresAt = generateExpiryTime(10);

      await PhoneVerification.findOneAndUpdate(
        { phoneNumber: phone_number },
        {
          verificationCode,
          expiresAt,
          attempts: 0,
          isUsed: false,
          ipAddress
        },
        { upsert: true, new: true }
      );

      // Send SMS
      const smsResult = await sendSms(maskPhoneNumber(phone_number), `Your verification code is ${verificationCode}`);

      res.json({
        success: true,
        message: 'Verification code sent again',
        maskedPhoneNumber: maskPhoneNumber(phone_number)
      });

    } catch (error) {
      console.error('Resend code error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to resend verification code'
      });
    }
  }


  // Get user's phone numbers
  async getPhones(req, res) {
    try {
      const userId = req.user.userId;
      
      const user = await User.findOne({ userId }).select('phone name userId');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        phones: user.phone,
        hasVerifiedPhone: user.phone.some(p => p.verified)
      });

    } catch (error) {
      console.error('Get phones error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Set default phone
  async setDefaultPhone(req, res) {
    try {
      const { phone_number } = req.body;
      const userId = req.user.userId;

      const user = await User.findOne({ userId });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const phone = user.phone.find(p => p.number === phone_number);
      if (!phone) {
        return res.status(404).json({
          success: false,
          message: 'Phone number not found'
        });
      }

      if (!phone.verified) {
        return res.status(400).json({
          success: false,
          message: 'Only verified phones can be set as default'
        });
      }

      await user.setDefaultPhone(phone_number);

      res.json({
        success: true,
        message: 'Default phone updated successfully',
        phones: user.phone
      });

    } catch (error) {
      console.error('Set default phone error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  // Remove phone number
  async removePhone(req, res) {
    try {
      const { phone_number } = req.body;
      const userId = req.user.userId;

      const user = await User.findOne({ userId });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if this is the only verified phone
      const verifiedPhones = user.phone.filter(p => p.verified);
      const phoneToRemove = user.phone.find(p => p.number === phone_number);
      
      if (verifiedPhones.length === 1 && phoneToRemove && phoneToRemove.verified) {
        return res.status(400).json({
          success: false,
          message: 'Cannot remove the only verified phone number'
        });
      }

      await user.removePhone(phone_number);

      // Also remove any verification records for this phone
      await PhoneVerification.deleteMany({
        userId,
        phoneNumber: { $regex: phone_number }
      });

      res.json({
        success: true,
        message: 'Phone number removed successfully',
        phones: user.phone
      });

    } catch (error) {
      console.error('Remove phone error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }
}

module.exports = new PhoneVerificationService();