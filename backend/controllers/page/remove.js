const Page = require("../../models/Page");
const ContentSection = require("../../models/ContentSection");
const Comment = require("../../models/Comment");
const Enrollment = require("../../models/Enrollment");
const Course = require("../../models/Course");

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
    const activeEnrollments = await Enrollment.exists({ course: page.courseId, status: "active" });
    if (activeEnrollments) {
      return res.status(403).json({ message: "This course has active enrollments; can't delete page" });
    }

    const { courseId, section, order } = page;

   // Perform all deletions & updates in a single Promise.all
   const [updatedContent, deletedComments, deletedPage, updatedPages] = await Promise.all([
    ContentSection.updateMany({ pageId }, { status: "deleted" }), // Soft delete ContentSection
    Comment.deleteMany({ pageId }), // Delete Comments
    Page.deleteOne({ _id: pageId }), // Delete Page
    Page.updateMany({ courseId, section, order: { $gt: order } }, { $inc: { order: -1 } }), // Adjust order
    Course.updateOne({ _id: courseId }, { $inc: { pageCount: -1 } }) // Decrement pageCount in Course

  ]);

  res.json({ 
    success: true, 
    message: `Page deleted. ${deletedComments.deletedCount} comments removed. ${updatedContent.modifiedCount} content sections marked for deletion. Order adjusted for ${updatedPages.modifiedCount} pages.`
  });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = remove;
