const twilio = require('twilio');
const OTP = require('../models/OTPModel');
const User = require('../models/User');
exports.sendVerificationSMS = async (phone, code) => {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  await client.messages.create({
    body: `Your verification code is: ${code}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone
  });
};

