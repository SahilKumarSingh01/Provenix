const ContentSection = require("../models/ContentSection");
const addUrls        = require('../utils/addUrls');
const getContent = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    const userId = req.user.id;

    // Resolve content section and enrollment in parallel
    const [contentSection, enrollment] = await Promise.all([
      ContentSection.findOne({ _id: contentSectionId, status: "active" }),
      Enrollment.findOne({
        course: (await ContentSection.findById(contentSectionId)).courseId,
        user: userId,
        status: "active",
      }),
    ]);

    if (!contentSection) {
      return res.status(404).json({ message: "Content section not found" });
    }

    // Check if user is the creator or has active enrollment
    if (!enrollment && contentSection.creatorId !== userId) {
      return res.status(403).json({ message: "Access denied. No active enrollment." });
    }

    // Modify content
    const modifiedContent = addUrls(contentSection);

    res.json({ success: true, content: modifiedContent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const reorder = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    const { index1, index2 } = req.body;
    const userId = req.user.id;

    // Fetch only the necessary fields to validate ownership and size
    const contentSection = await ContentSection.find({_id:contentSectionId,status:"draft"});
    if (!contentSection) return res.status(404).json({ message: "Content section not found" });

    // Ensure only the creator can reorder
    if (!contentSection.creatorId.equals(userId)) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    if (contentSection.status !== "draft") {
      return res.status(400).json({ message: "Reordering is only allowed in draft status" });
    }
    // Validate indices
    if (
      index1 === index2 ||
      index1 < 0 || index2 < 0 ||
      index1 >= contentSection.items.length ||
      index2 >= contentSection.items.length
    ) {
      return res.status(400).json({ message: "Invalid indices" });
    }

    // Swap items directly in MongoDB using $set
    const item1 = contentSection.items[index1];
    const item2 = contentSection.items[index2];

    await ContentSection.updateOne(
      { _id: contentSectionId },
      {
        $set: {
          [`items.${index1}`]: item2,
          [`items.${index2}`]: item1,
        },
      }
    );

    res.json({ success: true, message: "Items reordered successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { reorder,getContent };
