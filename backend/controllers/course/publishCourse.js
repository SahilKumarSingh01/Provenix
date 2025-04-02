const Course = require("../../models/Course");

const publishCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findOneAndUpdate(
            { _id: courseId, creator: req.user.id, status: "draft" }, // Filter
            { $set: { status: "published" } }, // Update
            { new:true}
        ).populate("creator", "username photo displayName").lean();

        if (!course) {
            return res.status(400).json({ success: false, message: "Course not found, already published, or unauthorized" });
        }

        res.status(200).json({ success: true,
             message: "Course published successfully!" ,
             course: { ...course, isCreator:true, isEnrolled:false }
            });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = publishCourse;
