const User = require("../../models/User.js");
const sendMail = require("../../config/sendMail.js");
const crypto =require('crypto');
const bcrypt =require('bcrypt');
require('dotenv').config();

const forgotPassword= async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user)
        return res.status(400).json({ success: false, message: "User not found" });
      if (!user.verifiedEmail)
        return res.status(400).json({ success: false, message: "Email not verified" });
      if (user.resetPasswordToken && user.resetPasswordExpiry > Date.now()) 
        return res.status(400).json({ message: 'Please wait for the current reset link to expire before requesting a new one.' });
      // Generate a secure random token
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpiry = Date.now() + 15 * 60 * 1000; // Expires in 15 min
      await user.save();
      console.log(resetToken)
      await sendMail({
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: "Password Reset Link",
        html: `<p>Click the link below to reset your password:</p>
               <a href="${process.env.CLIENT_URL}/reset-password?token=${resetToken}">Reset Password</a>
               <p>This link will expire in 15 minutes.</p>`
      });
      return res.status(200).json({ success: true, message: "Password reset link sent" });
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  };
const resetPassword =  async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      console.log(token+" "+newPassword);
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpiry: { $gt: Date.now() } // Token must be valid (not expired)
      });
  
      if (!user)
        return res.status(400).json({ success: false, message: "Invalid or expired token" });
  
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.resetPasswordToken = null; // Remove token after use
      user.resetPasswordExpiry = null;
      await user.save();
  
      return res.status(200).json({ success: true, message: "Password has been reset successfully" });
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }
  module.exports={forgotPassword,resetPassword};