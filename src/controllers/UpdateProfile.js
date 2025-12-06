const OTP = require('../models/Opt');
const User = require('../models/User');


exports.updateName = async (req, res) => {
    const { userId, name } = req.body;
    try {
      const user = await User.findOneAndUpdate({ userId }, { name, updatetimestamp: Date.now(), isNameVerified: true }, { new: true });
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.status(200).json({ message: 'Name updated successfully', user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  exports.verifyBirthday = async (req, res) => {
    console.log(req.body);
    const { userId, birthday } = req.body;
  
    try {
      // Check if the user exists
      const user = await User.findOne({ userId });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Update the user's birthday and verification status
      const updatedUser = await User.findOneAndUpdate(
        { userId },
        {
          $set: {
            birthday: birthday,
            isBirthdayVerified: true,
          },
        },
        { new: true } // Return the updated document
      );
  
      if (!updatedUser) {
        return res.status(400).json({ message: "Failed to verify birthday" });
      }
  
      console.log(updatedUser);
      return res.status(200).json({ message: "Birthday verified successfully", updatedUser });
    } catch (error) {
      console.error("Error verifying birthday:", error.message);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };



  const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: parseInt(process.env.SMTP_PORT),
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

  exports.sendotp = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
  
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min
  
    await OTP.deleteMany({ email }); // Clear existing OTPs
    await OTP.create({ email, otp, expiresAt });
  
    // await transporter.sendMail({
    //   from: process.env.EMAIL_FROM,
    //   to: email,
    //   subject: "Your Verification Code",
    //   html: `<h2>Your OTP is: ${otp}</h2><p>This code will expire in 1 minutes.</p>`,
    // });
  
    return res.json({ message: "OTP sent successfully" });
  };

  exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });
  
    const record = await OTP.findOne({ email, otp });
    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
  
    let user = await User.findOne({ email });
    if (!user) user = await User.create({ email });
  
    user.verified.email = true;
    await user.save();
  
    await OTP.deleteMany({ email });
  
    return res.json({ message: "Email verified successfully", user });
  };