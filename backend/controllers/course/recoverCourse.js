const Course = require("../../models/Course");
const Enrollment = require("../../models/Enrollment");

const recoverCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        // Fetch course and active enrollment status in parallel
        const [course, isActiveEnrollment] = await Promise.all([
            Course.findOne({ _id: courseId, creator: req.user.id, status: "deleted" }).select("updatedAt"),
            Enrollment.exists({ course: courseId, status: "active" })
        ]);

        if (!course) {
            return res.status(404).json({ message: "Course not found or not recoverable" });
        }

        const deletionTime = new Date(course.updatedAt).getTime() + 3600000; // updatedAt + 1 hour
        const recoveryDeadline = deletionTime - 300000; // 5 minutes before deletion

        if (Date.now() > recoveryDeadline &&!isActiveEnrollment) {
            return res.status(400).json({ message: "Course cannot be recovered as it's too close to deletion" });
        }

        // Determine new status
        const newStatus = isActiveEnrollment ? "published" : "draft";

        // Update course status
        await Course.updateOne({ _id: courseId }, { status: newStatus });

        return res.status(200).json({ message: "Course recovered successfully", status: newStatus });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = recoverCourse;
