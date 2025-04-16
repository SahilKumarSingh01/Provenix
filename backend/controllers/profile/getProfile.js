const User = require("../../models/User");

const getProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username })
      .select("username photo displayName profile status bio")
      .populate("profile");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user's status is "deleted" and they are not the current logged-in user
    if (user.status === "deleted" && user._id.toString() !== req.user.id) {
      return res.status(404).json({ error: "User does not exist" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = getProfile;
