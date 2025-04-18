const User = require("../../models/User");

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id; // assuming you're using some auth middleware that sets req.user

    const user = await User.findById(userId)
      .select("notifications")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Optional: Sort by newest first
    const sortedNotifications = [...user.notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({ notifications: sortedNotifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = getNotifications;
