const Page = require("../../models/Page");
const ContentSection = require("../../models/ContentSection");
const Comment = require("../../models/Comment");
const Enrollment = require("../../models/Enrollment");

const remove = async (req, res) => {
  try {
    const { pageId } = req.params;
    const userId = req.user.id;

    // Fetch the page with necessary fields (lean for efficiency)
    const page = await Page.findById(pageId);
    if (!page) return res.status(404).json({ message: "Page not found" });

    // Ensure only the creator can delete
    if (!page.creatorId.equals(userId)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Check active enrollments before deletion
    const activeEnrollments = await Enrollment.countDocuments({ course: page.courseId, status: "active" });
    if (activeEnrollments > 0) {
      return res.status(403).json({ message: "This course has active enrollments; can't delete page" });
    }

    const { courseId, section, order } = page;

    // Delete related data in parallel
    const [deletedContent, deletedComments] = await Promise.all([
      ContentSection.deleteMany({ pageId }), 
      Comment.deleteMany({ pageId }) 
    ]);

    // Delete the page
    await Page.deleteOne({ _id: pageId });

    // Adjust order of remaining pages in the same section
    await Page.updateMany(
      { courseId, section, order: { $gt: order } },
      { $inc: { order: -1 } }
    );

    res.json({ 
      success: true, 
      message: `Page deleted successfully. Removed ${deletedContent.deletedCount} content sections and ${deletedComments.deletedCount} comments.` 
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = remove;
