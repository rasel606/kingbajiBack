const User = require('../Models/User');


exports.updateName = async (req, res) => {
    const { userId, name } = req.body;
    try {
      const user = await User.findOneAndUpdate({ userId }, { name }, { new: true });
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

  exports.SandOpt = async (req, res) => {
    const { userId,email } = req.body;
    console.log(userId,email );
    if (!userId) return res.status(400).json({ message: 'Email is required.' });

    try {
        const otp = generateOTP();
        const otpExpiration = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes

        let user = await User.findOne({ userId });

        if (!user) {
            user = new User({ email, otp, otpExpiration });
        } else {
            user.otp = otp;
            user.otpExpiration = otpExpiration;
        }

        await user.save();

        await transporter.sendMail({
            from: 'verifyemail@kingbaji.com',
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otp}. It is valid for 5 minutes.`
        });
        console.log(user);
        res.status(200).json({ message: 'OTP sent successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending OTP.', error });
    }
};

exports.VerifyOpt = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required.' });

  try {
      const user = await User.findOne({ email });

      if (!user) return res.status(404).json({ message: 'User not found.' });

      if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP.' });

      if (user.otpExpiration < new Date()) return res.status(400).json({ message: 'OTP expired.' });

      res.status(200).json({ message: 'OTP verified successfully.' });
  } catch (error) {
      res.status(500).json({ message: 'Error verifying OTP.', error });
  }
};