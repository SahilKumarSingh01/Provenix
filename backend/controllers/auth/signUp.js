const bcrypt = require("bcrypt");
const User = require("../../models/User.js");
const Profile = require("../../models/Profile.js");

const UniqueUsername = async (displayName) => {
    let baseUsername = displayName.replace(/\s+/g, '');
    const lastUser = await User.findOne({ username: new RegExp(`^${baseUsername}\\d*$`)}).sort({ username: -1 })
    if (!lastUser)
      return baseUsername; 
    const num = lastUser.username.match(/\d+$/); // Get trailing number
    const val=num?parseInt(num[0]):0;
    return `${baseUsername}${val+1}`;
};

const signUp = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // Regular Expressions
    const usernameRegex = /^[^\s]+$/; // No spaces
    const passwordRegex = /^.{6,}$/; // At least 6 characters
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Valid email format

    if (!username || !usernameRegex.test(username))
      return res.status(400).json({ message: "Username must not contain spaces and cannot be empty." });

    if (!password || !passwordRegex.test(password))
      return res.status(400).json({ message: "Password must be at least 6 characters long." });

    if (!email || !emailRegex.test(email))
      return res.status(400).json({ message: "Please provide a valid email." });

    let user = await User.findOne({ $or: [{ username }, { email }] });

    if (user) {
      if (user.username === username) {
        const newUsername = await UniqueUsername(username);
        return res.status(400).json({ message: `Username is already taken, try ${newUsername}` });
      }
      if (user.verifiedEmail) {
        return res.status(400).json({ message: "Email is already taken." });
      }
      // If email exists but is not verified, reset it
      await User.updateOne({ _id: user._id }, { $set: { verifiedEmail: false, email: "" } });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User and Profile
    const newUser = await User.create({ username, password: hashedPassword, email });
    const newProfile = await Profile.create({ user: newUser._id });

    // Link Profile to User
    await User.updateOne({ _id: newUser._id }, { profile: newProfile._id });

    return res.status(200).json({ success: true, message: "User signed up successfully." });

  } catch (e) {
    res.status(500).json({ message: `Server error: ${e.message}` });
  }
};

module.exports = signUp;
