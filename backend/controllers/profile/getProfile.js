const User = require("../../models/User");

const getProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username })
            .select("username photo displayName profile")
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

module.exports = getProfile;
