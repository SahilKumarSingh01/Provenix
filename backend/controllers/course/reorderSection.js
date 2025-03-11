const Course = require("../../models/Course");

const reorderSection = async (req, res) => {
    try {
        const { courseId } = req.params;
        let { index1, index2 } = req.body;

        // Convert to numbers and validate
        index1 = Number(index1);
        index2 = Number(index2);

        if (isNaN(index1) || isNaN(index2))
            return res.status(400).json({ success: false, message: "Indices must be numbers" });

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ success: false, message: "Course not found" });

        if (!course.creator.equals(req.user.id))
            return res.status(403).json({ success: false, message: "Unauthorized to update this course" });

        const sections = course.sections;

        if (index1 < 0 || index1 >= sections.length || index2 < 0 || index2 >= sections.length)
            return res.status(400).json({ success: false, message: "Invalid indices" });

        // Swap the sections
        [sections[index1], sections[index2]] = [sections[index2], sections[index1]];

        await course.save();

        res.status(200).json({ success: true, message: "Sections reordered!", sections });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = reorderSection;
