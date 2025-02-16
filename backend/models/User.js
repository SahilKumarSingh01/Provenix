const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  googleid: {
    type: String,
    unique: true,
    sparse: true,
  },
  githubid: {
    type: String,
    unique: true,
    sparse: true,
  },
  photo: String,
  displayName: String,
  verifiedEmail: {
    type: Boolean,
    default: false,
  },
  verificationOTP: String,
  OTPSendTime: Number,
  resetPasswordToken: String,
  resetPasswordExpiry: Number,
}, {
  timestamps: true,
});

const User = mongoose.model("User", userSchema);

module.exports = User;