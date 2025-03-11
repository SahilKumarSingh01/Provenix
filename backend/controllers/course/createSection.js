const Course = require("../../models/Course");

const createSection = async (req, res) => {
    try {
        const { title } = req.body;
        const { courseId } = req.params;

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ success: false, message: "Course not found" });

        if (!course.creator.equals(req.user.id))
            return res.status(403).json({ success: false, message: "Unauthorized to update this course" });

        // **Fix: Store the updated course and await the update**
        const updatedCourse = await Course.findOneAndUpdate(
            { _id: courseId },
            { $addToSet: { sections: title } },
            { new: true } // Return updated course
        );

        res.status(201).json({ success: true, message: "Section created!", course: updatedCourse });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = createSection;
