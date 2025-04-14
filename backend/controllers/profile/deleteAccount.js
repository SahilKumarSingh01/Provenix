const User = require("../../models/User.js");
const Course = require("../../models/Course");

const sendMail = require("../../config/sendMail.js");
const crypto =require('crypto');
require('dotenv').config();

const generateToken = async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user)
        return res.status(400).json({ success: false, message: "User not found" });
      
      if (!user.email)
        return res.status(400).json({ success: false, message: "User email is not set" });

      if (!user.verifiedEmail)
        return res.status(400).json({ success: false, message: "Email not verified" });
  
  
      if (user.resetPasswordToken && user.resetPasswordExpiry > Date.now())
        return res.status(400).json({
          success: false,
          message: "Please wait for the current token to expire before requesting again.",
        });
  
      const token = crypto.randomBytes(32).toString("hex");
      user.resetPasswordToken = token;
      user.resetPasswordExpiry = Date.now() + 15 * 60 * 1000; // 15 mins
      await user.save();
  
      await sendMail({
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: "Account Deletion Link",
        html: `<p>Click the link below to proceed with account deletion:</p>
               <a href="${process.env.CLIENT_URL}/account-delete?token=${token}">Delete My Account</a>
               <p>This link will expire in 15 minutes.</p>`,
      });
  
      return res.status(200).json({ success: true, message: "Deletion link sent to your email" });
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  };
  

  const verifyAndDelete = async (req, res) => {
    try {
      const { token} = req.query;
  
      const user = await User.findOne({
        _id:req.user.id,
        resetPasswordToken: token,
        resetPasswordExpiry: { $gt: Date.now() },
      });
  
      if (!user)
        return res.status(400).json({ success: false, message: "Invalid or expired token" });
  
      await Promise.all([
        // Mark user as deleted
        User.updateOne({ _id: user._id }, { status: "deleted" ,resetPasswordToken:null,resetPasswordExpiry:null}),
      
        // Mark course as deleted only if it belongs to the user and is not already deleted
        Course.updateOne(
          {creator: req.user.id },
          { status: "deleted" }
        )
      ]);
  
      return res.status(200).json({
        success: true,
        message: `Account marked for deletion. Courses are also flagged. You can still sign
         in and recover your account within 1 hour.`
      });
          } catch (e) {
      res.status(500).json({ message: e.message });
    }
  };
  

  module.exports={generateToken,verifyAndDelete}