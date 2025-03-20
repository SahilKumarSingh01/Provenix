const ContentSection = require("../../models/ContentSection");
const cloudinary = require("../../config/cloudinary");

const removeDeletedContentSections = async () => {
  try {
    const deletedContentSections = await ContentSection.find({ status: "deleted" });

    if (deletedContentSections.length === 0) {
      console.log("[CRON] No deleted content sections to remove.");
      return;
    }

    let publicIds = [];

    // Collect all publicIds from deleted content sections
    deletedContentSections.forEach((contentSection) => {
      contentSection.items.forEach((contentItem) => {
        if (contentItem.type === "image" || contentItem.type === "video") {
          publicIds.push(contentItem.data.publicId);
        } else if (contentItem.type === "MCQ") {
          if (contentItem.data.question?.publicId) {
            publicIds.push(contentItem.data.question.publicId);
          }
          contentItem.data.options.forEach((option) => {
            if (option.publicId) {
              publicIds.push(option.publicId);
            }
          });
        }
      });
    });

    // Remove content sections from the database
    await ContentSection.deleteMany({ _id: { $in: deletedContentSections.map(({ _id }) => _id) } });

    console.log(`[CRON] Removed ${deletedContentSections.length} deleted content sections.`);

    // Bulk delete Cloudinary resources
    if (publicIds.length > 0) {
      const result = await cloudinary.api.delete_resources(publicIds);
      console.log(`[CRON] Removed ${publicIds.length} Cloudinary resources.`);
    } else {
      console.log("[CRON] No Cloudinary resources found for deletion.");
    }
  } catch (error) {
    console.error("[CRON] Error removing deleted content sections:", error);
  }
};

module.exports = removeDeletedContentSections;
