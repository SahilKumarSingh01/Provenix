const Course = require("../../models/Course");

const createSection = async (req, res) => {
    try {
        const { title } = req.body;
        const { courseId } = req.params;

        const updatedCourse = await Course.findOneAndUpdate(
            { _id: courseId, creator: req.user.id }, // Ensures only the creator can update
            { $push: { sections: { title } } }, // Pushes the new section with 'title'
            { new: true } // Returns the updated course
        );

        if (!updatedCourse)
            return res.status(404).json({ success: false, message: "Course not found or unauthorized" });

        res.status(201).json({ success: true, message: "Section created!", sections: updatedCourse.sections });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = createSection;
