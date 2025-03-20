const Course = require("../../models/Course");
const Page = require("../../models/Page");
const Comment = require("../../models/Comment");
const ContentSection = require("../../models/ContentSection");
// const Enrollment = require("../../models/Enrollment");

const removeSection = async (req, res) => {
    try {
        const { title } = req.body;
        const { courseId } = req.params;

        const updatedCourse = await Course.findOneAndUpdate(
            { _id: courseId, creator: req.user.id, status: { $ne: "published" } }, // Ensure it's not published
            { $pull: { sections: title } },
            { new: true }
        );

        if (!updatedCourse) {
            return res.status(403).json({ success: false, message: "Unauthorized or cannot modify a published course" });
        }

        await Promise.all([
            Page.deleteMany({ courseId, section: title }),
            Comment.deleteMany({ courseId, section: title }),
            ContentSection.updateMany({ courseId }, { status: "deleted" }) // Soft delete ContentSection
        ]);

        res.status(200).json({ success: true, message: "Section deleted successfully", course: updatedCourse });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


module.exports = removeSection;
