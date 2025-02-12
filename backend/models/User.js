const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String, // Plain-text password (for simplicity)
});

const User = mongoose.model("User", UserSchema);
module.exports = User;














// const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");

// const userSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String },
//   oauthProvider: { type: String, enum: ["google", "github", null], default: null },
//   oauthId: { type: String, default: null },
//   verified: { type: Boolean, default: false },
//   verificationToken: { type: String },
// }, { timestamps: true });

// // Hash password before saving (only for username/password sign-ups)
// userSchema.pre("save", async function (next) {
//   if (this.isModified("password") && this.password) {
//     this.password = await bcrypt.hash(this.password, 10);
//   }
//   next();
// });

// // Compare password for login
// userSchema.methods.comparePassword = async function (password) {
//   return bcrypt.compare(password, this.password);
// };

// module.exports = mongoose.model("User", userSchema);
