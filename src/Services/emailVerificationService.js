// services/emailVerificationService.js
const User = require('../models/User');
const EmailVerification = require('../Models/EmailVerification');
const { generateVerificationCode, generateExpiryTime } = require('../utils/generateCode');
const { sendEmail } = require('../utils/sendEmail');

class EmailVerificationService {
  // Send verification code
  async sendVerificationCode(req, res) {
    try {
      const { email } = req.body;
      const userId = req.user.userId;

      // Check if email already exists
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'Email already in use.' });
      }

      const code = generateVerificationCode();
      const expiresAt = generateExpiryTime(10); // 10 mins

      // Save verification record
      await EmailVerification.findOneAndUpdate(
        { userId, email },
        { verificationCode: code, expiresAt, isUsed: false },
        { upsert: true, new: true }
      );

      // Send email
      await sendEmail(email, 'Verification Code', `Your verification code is ${code}`);

      res.json({ success: true, message: 'Verification code sent', expiresIn: '10 minutes' });
    } catch (error) {
      console.error('Send verification code error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  // Verify code
  async verifyCode(req, res) {
    try {
      const { email, verification_code } = req.body;
      const userId = req.user.userId;

      const record = await EmailVerification.findOne({
        userId,
        email,
        verificationCode: verification_code,
        isUsed: false,
        expiresAt: { $gt: new Date() },
      });

      if (!record) {
        return res.status(400).json({ success: false, message: 'Invalid or expired code' });
      }

      record.isUsed = true;
      await record.save();

      // Mark user as verified
      const user = await User.findByIdAndUpdate(userId, { email, isEmailVerified: true }, { new: true });

      res.json({ success: true, message: 'Email verified successfully', user });
    } catch (error) {
      console.error('Verify code error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  // Resend code
  async resendVerificationCode(req, res) {
    try {
      const { email } = req.body;
      const userId = req.user.userId;

      const code = generateVerificationCode();
      const expiresAt = generateExpiryTime(10);

      await EmailVerification.findOneAndUpdate(
        { userId, email },
        { verificationCode: code, expiresAt, isUsed: false },
        { upsert: true, new: true }
      );

      await sendEmail(email, 'Verification Code', `Your verification code is ${code}`);

      res.json({ success: true, message: 'Verification code resent', expiresIn: '10 minutes' });
    } catch (error) {
      console.error('Resend code error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}

module.exports = new EmailVerificationService();
