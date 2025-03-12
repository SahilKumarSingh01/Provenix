const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    index:true,
  },
  photo: String,
  displayName: String,
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

userSchema.methods.getInfo = function () {
  return {
    username: this.username,
    photo: this.photo,
    displayName: this.displayName || this.username, 
    verifiedEmail: this.verifiedEmail,
  };
};

 

module.exports=mongoose.model("User", userSchema);