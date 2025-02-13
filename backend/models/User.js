const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // Ensures no duplicate usernames
  },
  password:String,
  email: {
    type: String,
    unique: true, // Ensures no duplicate emails
  },
  googleid: {
    type: String, // For Google OAuth
    unique: true,
    sparse: true, // Index the field for uniqueness but allows empty values
  },
  githubid: {
    type: String, // For GitHub OAuth
    unique: true,
    sparse: true, // Index the field for uniqueness but allows empty values
  },
  photo: String, // Optional: Store URL of profile picture (for Google/Github login)
  displayName: String, // Optional: Store the name from Google or GitHub
  verifiedEmail: {
    type: Boolean,
    default: false, // Whether the email is verified
  },
  verificationOTP: String, // OTP for email verification
  OTPSendTime: Number, // Time when OTP was sent
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt
});

// Create the User model
const User = mongoose.model("User", userSchema);

module.exports = User;
