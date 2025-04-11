const mongoose =require('mongoose');
const ContentSection = require("../models/ContentSection");
const InsightSection = require("../models/InsightSection");

const getInsight = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    const userId = req.user.id;

    // Step 1: Fetch ContentSection
    const contentSection = await ContentSection.findById(contentSectionId).select('-items');
    if (!contentSection || contentSection.status === "deleted") {
      return res.status(404).json({ message: "Content section not found" });
    }

    const { pageId, moduleId, courseId } = contentSection;

    // Step 2: Find or create InsightSection
    const insightSection = await InsightSection.findOneAndUpdate(
      {
        contentSectionId,
        userId,
        pageId,
        moduleId,
        courseId,
      },
      {}, // No updates — just trigger upsert if not found
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({ insightSection });
  } catch (error) {
    console.error("Error in getInsight:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const updateInsight = async (req, res) => {
  try {
    const { insightSectionId } = req.params;
    const { insight } = req.body;
    const userId = req.user.id;

    if (!insight || !insight.itemId) {
      return res.status(400).json({ message: "insight with itemId is required" });
    }
    const itemObjectId = new mongoose.Types.ObjectId(insight.itemId);

    const updated = await InsightSection.findOneAndUpdate(
      { _id: insightSectionId, userId },
      [
        {
          $set: {
            insights: {
              $concatArrays: [
                {
                  $filter: {
                    input: "$insights",
                    as: "insight",
                    cond: { $ne: ["$$insight.itemId", itemObjectId] },
                  },
                },
                [{ itemId: itemObjectId, data: insight.data }],
              ],
            },
          },
        },
      ],
    );

    if (!updated) {
      return res.status(404).json({ message: "Insight section not found" });
    }
    res.status(200).json({ message: "Insight updated", insightSection: updated });
  } catch (error) {
    console.error("Error in updateInsight:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = { getInsight ,updateInsight};
