const Course = require("../../models/Course");

const getCreatedCourses = async (req, res) => {
    try {
        let { skip = 0, limit = 6, sortBy = "createdAt", order = -1 } = req.query;

        // Convert skip and limit to numbers
        skip = parseInt(skip);
        limit = parseInt(limit);
        order = parseInt(order); // Ensure order is a number (-1 for descending, 1 for ascending)

        const courses = await Course.find({ creator: req.user.id })// Populate creator details
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
