const Course = require("../../models/Course"); 
const Enrollment=require('../../models/Enrollment');

const updateDetails = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ success: false, message: "Course not found" });

        // Ensure only the creator can update
        if (!course.creator.equals(req.user.id)) {
            return res.status(403).json({ success: false, message: "Unauthorized to update this course" });
        }

        // Check if course has active enrollments
        const isEnrolled = await Enrollment.exists({ course: courseId, status: "active" });

        // Fields that can be updated
        const userEditableFields = ["description", "thumbnail", "tags", "title", "category", "price", "level"];
        const enrolledEditableFields = ["description", "thumbnail", "tags"];

        // Allow only a subset of fields if there are active enrollments
        const allowedFields = isEnrolled ? enrolledEditableFields : userEditableFields;
        const updateData = Object.fromEntries(
            Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
        );

        // Prevent updating restricted fields
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ success: false, message: "No valid fields to update" });
        }

        const updatedCourse = await Course.findByIdAndUpdate(courseId, { $set: updateData }, { new: true });

        res.status(200).json({ success: true, message: "Course updated!", course: updatedCourse });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = updateDetails;

module.exports=updateDetails;
