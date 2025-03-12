const Page = require("../../models/Page");
const Comment = require("../../models/Comment");
const ContentSection = require("../../models/ContentSection");
const Course = require("../../models/Course");
const Enrollment = require("../../models/Enrollment");

const removeAll = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { section } = req.body;
    const userId = req.user.id;

    // Fetch the course to verify authentication and section validity
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Ensure only the creator can delete
    if (!course.creator.equals(userId)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Check if the provided section exists in the course
    if (!course.sections.includes(section)) {
      return res.status(400).json({ message: "Invalid section" });
    }

    // Check active enrollments
    const activeEnrollments = await Enrollment.countDocuments({ course:courseId, status: "active" });
    if (activeEnrollments > 0) {
      return res.status(403).json({ message: "This course has active enrollments; can't delete section" });
    }

    // Delete related data in parallel
    const [pagesResult, commentsResult, contentSectionsResult] = await Promise.all([
      Page.deleteMany({ courseId, section }),
      Comment.deleteMany({ courseId, section }),
      ContentSection.updateMany({ courseId,section }, { status: "deleted" }), // Soft delete ContentSection
    ]);

    const pagesDeleted = pagesResult.deletedCount || 0;

    // Remove the section from the course & update page count in one go
    await Course.updateOne(
      { _id: courseId },
      { 
        $pull: { sections: section }, 
        $inc: { pageCount: -pagesDeleted }
      }
    );

    res.json({ 
      message: `Removed ${pagesDeleted} pages, ${commentsResult.deletedCount} comments, and ${contentSectionsResult.deletedCount} content sections from section: ${section}. Section removed from course.` 
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = removeAll;
