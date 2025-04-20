const Enrollment = require("../../models/Enrollment");
const InsightSection = require("../../models/InsightSection");
const Course =require('../../models/Course')
const removeEnrollment = async (req, res) => {
    try {
        const { enrollmentId } = req.params;
        const userId = req.user.id;
        // Fetch enrollment to verify user and get courseId
        const enrollment = await Enrollment.findOne({ _id: enrollmentId, user: userId });

        if (!enrollment) {
            return res.status(404).json({ success: false, message: "Enrollment not found" });
        }

        const courseId = enrollment.course;

        // Delete enrollment & progress sections in parallel
        await Promise.all([
            Enrollment.deleteOne({ _id: enrollmentId }),
            InsightSection.deleteMany({ courseId, userId }),
            Course.findOneAndUpdate(
                { _id: courseId },  // Find the course by courseId
                { $inc: { totalEnrollment: -1 } },  // Decrease totalEnrollment by 1
                { new: true }  // Optionally, return the updated document
            )
        ]);
        

        res.status(200).json({ success: true, message: "Enrollment and progress sections removed successfully" });

    } catch (error) {
        res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
    }
};

module.exports = removeEnrollment;
