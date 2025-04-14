const User = require('../../models/User');

const recoverAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Mark user as active again
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, status: "deleted" },
      { status: "active" },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found or already active." });
    }

    return res.status(200).json({ success: true, message: "Account successfully recovered." });
  } catch (error) {
    console.error("Recover account error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong." });
  }
};

module.exports = recoverAccount;
