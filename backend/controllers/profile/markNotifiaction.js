const User = require("../../models/User");

const markNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifId = req.query.notifId;
    const result = await User.updateOne(
      { _id: userId, "notifications._id": notifId },
      { $set: { "notifications.$.read": true } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Notification not found or already read." });
    }

    res.status(200).json({ message: "Notification marked as read." });
  } catch (err) {
    console.error("Error marking notification:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

module.exports = markNotification ;
