const Course = require("../../models/Course");

const removeCourse = async (req, res) => {
    try {
        const result = await Course.updateOne(
            { _id: req.params.courseId, creator: req.user.id },
            { status: "deleted" }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ success: false, message: "Course not found or unauthorized" });
        }

        // **Delete all related data in parallel, including the course itself**
        // await Promise.all([
        //     Page.deleteMany({ courseId: req.params.courseId }),       // Delete all pages of the course
        //     Comment.deleteMany({ courseId: req.params.courseId }),    // Delete all comments
        //     Review.deleteMany({ courseId: req.params.courseId }),     // Delete all reviews
        //     ContentSection.updateMany({ courseId: req.params.courseId }, { status: "deleted" }), // Soft delete ContentSection
        //     Course.deleteOne({ _id: req.params.courseId }) // Finally, delete the course itself
        // ]);

        res.status(200).json({ success: true, message: "Course marked as deleted. It will be permanently removed after 1 hour." });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


module.exports = removeCourse;
