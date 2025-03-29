const Course = require("../../models/Course");
const Page = require("../../models/Page");
const Comment = require("../../models/Comment");
const ContentSection = require("../../models/ContentSection");

const removeSection = async (req, res) => {
    try {
        const { sectionId } = req.query;
        const { courseId } = req.params;

        // Remove section only if the course is not published
        const updatedCourse = await Course.findOneAndUpdate(
            { _id: courseId, creator: req.user.id, status: "draft" ,"sections._id":sectionId  },
            { $pull: { sections: { _id: sectionId } } }, // Remove by sectionId
            { new: true }
        );

        if (!updatedCourse) {
            return res.status(403).json({ success: false, message: "Unauthorized or cannot modify a published course" });
        }

        // Remove related data linked to this sectionId
        await Promise.all([
            Page.deleteMany({ courseId, sectionId }),
            Comment.deleteMany({ courseId, sectionId }),
            ContentSection.updateMany({ courseId, sectionId }, { status: "deleted" }) // Soft delete ContentSection
        ]);

        res.status(200).json({ success: true, message: "Section deleted successfully",  sections: updatedCourse.sections });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = removeSection;
