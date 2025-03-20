const InsightSection = require("../models/InsightSection");
const ContentSection = require("../models/ContentSection");

const edit = async (req, res) => {
  try {
    const { contentSectionId, courseId } = req.params;
    const { index, newItem } = req.body;
    const userId = req.user._id;

    if (index === undefined || newItem === undefined) {
      return res.status(400).json({ message: "Index and newItem are required." });
    }

    // Fetch contentSection & check active enrollment in parallel
    const [contentSection, hasActiveEnrollment] = await Promise.all([
      ContentSection.findOne({ _id: contentSectionId, courseId }).select("_id pageId section"),
      Enrollment.exists({ userId, courseId, status: "active" })
    ]);

    if (!contentSection) {
      return res.status(404).json({ message: "Content section not found." });
    }

    if (!hasActiveEnrollment) {
      return res.status(403).json({ message: "No active enrollment found." });
    }

    // Upsert using required fields from ContentSection as filter
    const filter = {
      contentSectionId: contentSection._id,
      courseId,
      pageId: contentSection.pageId,
      section: contentSection.section,
      userId,
    };

    // Update or insert new item at index
    const updatedInsight = await InsightSection.findOneAndUpdate(
      filter,
      { $set: { [`items.${index}`]: newItem } },
      { new: true, upsert: true, projection: { [`items.${index}`]: 1 } } // Fetch only the updated item
    );

    return res.status(200).json({ newItem: updatedInsight?.items?.[index] || newItem });
  } catch (error) {
    console.error("Error updating insight section:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};




const getInsights = async (req, res) => {
  try {
    const { contentSectionId, courseId } = req.params;
    const userId = req.user._id;

    // Fetch the full InsightSection document
    const insightSection = await InsightSection.findOne({ contentSectionId, userId, courseId });

    if (!insightSection) {
      return res.status(404).json({ message: "Insight section not found." });
    }

    res.status(200).json({ insight: insightSection });
  } catch (error) {
    console.error("Error fetching insight section:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};



module.exports = { edit, getInsights};
