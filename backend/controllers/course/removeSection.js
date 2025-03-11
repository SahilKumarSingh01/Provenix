const Course = require("../../models/Course");
const Page = require("../../models/Page");
const Comment = require("../../models/Comment");
const ContentSection = require("../../models/ContentSection");
const Enrollment = require("../../models/Enrollment");

const removeSection = async (req, res) => {
    try {
        const { title } = req.body;
        const { courseId } = req.params;

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ success: false, message: "Course not found" });

        if (!course.creator.equals(req.user.id)) {
            return res.status(403).json({ success: false, message: "Unauthorized to modify this course" });
        }

        const activeEnrollment = await Enrollment.exists({ course:courseId, status: "active" });
        if (activeEnrollment) {
            return res.status(400).json({ success: false, message: "Cannot delete section with active enrollments" });
        }

        const [updatedCourse] = await Promise.all([
          Course.findOneAndUpdate(
              { _id: courseId },
              { $pull: { sections: title } },
              { new: true } // Return updated course
          ),
          Page.deleteMany({ courseId, section: title }),
          Comment.deleteMany({ courseId, section: title }),
          ContentSection.deleteMany({ courseId, section: title })
      ]);

      res.status(200).json({ success: true, message: "Section deleted successfully", course: updatedCourse });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = removeSection;
