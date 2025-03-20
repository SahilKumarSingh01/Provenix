const Course = require("../../models/Course");

const publishCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const result = await Course.updateOne(
            { _id: courseId, creator: req.user.id, status: "draft" }, // Filter
            { $set: { status: "published" } } // Update
        );

        if (result.modifiedCount === 0) {
            return res.status(400).json({ success: false, message: "Course not found, already published, or unauthorized" });
        }

        res.status(200).json({ success: true, message: "Course published successfully!" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = publishCourse;
