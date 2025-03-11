const Course = require("../../models/Course");

const updateSection = async (req, res) => {
    try {
        const { oldTitle, newTitle } = req.body;
        const { courseId } = req.params;

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ success: false, message: "Course not found" });

        if (!course.creator.equals(req.user.id))
            return res.status(403).json({ success: false, message: "Unauthorized to update this course" });
        // **Check if the newTitle already exists**
        if (course.sections.includes(newTitle)) {
            return res.status(400).json({ success: false, message: "Section title must be unique" });
        }
        // **Update section name using $set**
        const updatedCourse = await Course.findOneAndUpdate(
            { _id: courseId, sections: oldTitle }, // Ensure oldTitle exists
            { $set: { "sections.$": newTitle } }, // Update only the matched section
            { new: true }
        );

        if (!updatedCourse)
            return res.status(404).json({ success: false, message: "Section not found" });

        res.status(200).json({ success: true, message: "Section updated!", course: updatedCourse });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = updateSection;
