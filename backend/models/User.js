const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["comment"], // Can be extended in the future
    required: true,
  },
  data: {
    type: mongoose.Schema.Types.Mixed, // Stores different structures based on type
    required: true,
  },
  read: {
    type: Boolean,
    default: false, // Tracks if the notification has been read
  },
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, index: true },
  photo: String,
  displayName: String,
  profile: {type:mongoose.Schema.Types.ObjectId,ref:"Profile"},
  accountId: { type: String ,default:""},
  password: String,
  email: { type: String, unique: true },
  googleid: { type: String, unique: true, sparse: true },
  githubid: { type: String, unique: true, sparse: true },
  verifiedEmail: { type: Boolean, default: false },
  verificationOTP: String,
  OTPSendTime: Number,
  resetPasswordToken: String,
  resetPasswordExpiry: Number,

  notifications: [notificationSchema], // Array of notifications inside user
  
}, { timestamps: true });

userSchema.methods.getInfo = function () {
  return {
    _id:this._id,
    username: this.username,
    photo: this.photo,
    displayName: this.displayName || this.username, 
    verifiedEmail: this.verifiedEmail,
  };
};

module.exports = mongoose.model("User", userSchema);
