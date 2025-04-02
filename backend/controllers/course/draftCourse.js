const Course = require("../../models/Course");
const Enrollment = require("../../models/Enrollment");

const draftCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        // Fetch course and check for enrollments in parallel
        const [course, hasEnrollments] = await Promise.all([
            Course.findOne({ _id: courseId, creator: req.user.id, status: "published" }).select("_id"),
            Enrollment.exists({ course: courseId, status: "active" })
        ]);

        // Course not found or doesn't belong to the user
        if (!course) {
            return res.status(404).json({ message: "Course not found or not eligible for draft" });
        }

        // If there are enrollments, prevent moving to draft
        if (hasEnrollments) {
            return res.status(400).json({ message: "Course has active enrollments and cannot be drafted." });
        }

        // Update course status to draft
        const updatedCourse = await Course.findOneAndUpdate(
            { _id: courseId },
            { status: "draft" },
            { new: true }
        ).populate("creator", "username photo displayName").lean();

        return res.status(200).json({ message: "Course moved to draft successfully",
            course: { ...updatedCourse, isCreator:true, isEnrolled:false }});

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = draftCourse;
