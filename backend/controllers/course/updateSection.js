const Course = require("../../models/Course");

const updateSection = async (req, res) => {
    try {
        const { sectionId, title } = req.body;
        const { courseId } = req.params;

        const updatedCourse = await Course.findOneAndUpdate(
            { _id: courseId, creator: req.user.id, "sections._id": sectionId, "sections.title": { $ne: title } }, 
            { $set: { "sections.$.title": title } }, 
            { new: true }
        );
        if (!updatedCourse)
            return res.status(404).json({ success: false, message: "Section not found or title already exists" });

        res.status(200).json({ success: true, message: "Section updated!", sections: updatedCourse.sections });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = updateSection;
