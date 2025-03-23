const Course = require("../../models/Course");

const getCreatedCourses = async (req, res) => {
    try {
        let { skip = 0, limit = 6, sortBy = "createdAt", order = -1, status, price, level } = req.query;

        // Convert skip, limit, and order to numbers
        skip = parseInt(skip);
        limit = parseInt(limit);
        order = parseInt(order);

        // Build the filter query
        let filter = { creator: req.user.id };

        if (status) filter.status = status;
        if (level) filter.level = level;

        // Handle price filtering
        if (price === "free") {
            filter.price = 0;
        } else if (price === "paid") {
            filter.price = { $gt: 0 };
        }

        const courses = await Course.find(filter)
            .sort({ [sortBy]: order })
            .skip(skip)
            .limit(limit)
            .populate("creator", "username photo displayName")
            .lean(); // Optimize query performance

        res.json({ success: true, courses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


module.exports = getCreatedCourses;
