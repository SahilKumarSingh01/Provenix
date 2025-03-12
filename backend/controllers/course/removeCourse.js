const Course = require("../../models/Course");
const Enrollment = require("../../models/Enrollment");
const Page = require("../../models/Page");
const Comment = require("../../models/Comment");
const Review = require("../../models/Review");
const ContentSection = require("../../models/ContentSection");

const removeCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) return res.status(404).json({ success: false, message: "Course not found" });

        // Check if the user is the creator
        if (!course.creator.equals(req.user.id)) {
            return res.status(403).json({ success: false, message: "Unauthorized to delete this course" });
        }

        // Count active enrollments dynamically
        const activeEnrollments = await Enrollment.countDocuments({ course: course._id, status: "active" });

        if (activeEnrollments > 0) {
            // Soft delete: Mark course as "deleted" but allow enrolled users to access
            course.status = "deleted"; // Not visible in searches but accessible to enrolled users
            await course.save();
            return res.status(200).json({ success: true, message: "Course marked as deleted but still accessible to enrolled users" });
        }

        // **Delete all related data in parallel, including the course itself**
        await Promise.all([
            Page.deleteMany({ courseId: course._id }),       // Delete all pages of the course
            Comment.deleteMany({ courseId: course._id }),    // Delete all comments
            Review.deleteMany({ courseId: course._id }),     // Delete all reviews
            ContentSection.updateMany({ courseId }, { status: "deleted" }), // Soft delete ContentSection
            Course.findByIdAndDelete(course._id) // Finally, delete the course itself
        ]);

        res.status(200).json({ success: true, message: "Course deleted permanently" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = removeCourse;
