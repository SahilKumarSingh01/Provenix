const User = require("../../models/User");

const getAll = async (req, res) => {
    try {
        const { startWith = "", skip = 0, limit = 10 } = req.query;

        const users = await User.find(
            { username: new RegExp(`^${startWith}`, "i") }, // Case-insensitive regex match
            { username: 1, displayName: 1, photo: 1, _id: 0 } // Only return required fields
        )
        .sort({ username: 1 }) // Sort by username
        .skip(parseInt(skip)) // Apply skip
        .limit(parseInt(limit)); // Apply limit

        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = getAll;
