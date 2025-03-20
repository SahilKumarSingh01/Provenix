const User = require("../../models/User");

const getMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId)
            .select("username photo displayName profile accountId email verifiedEmail notifications")
            .populate("profile");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = getMyProfile;
