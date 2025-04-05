const ContentSection = require("../models/ContentSection");
const Enrollment = require("../models/Enrollment");
const addUrls        = require('../utils/addUrls');


const getContent = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    const userId = req.user.id;

    // Fetch content section first
    const contentSection = await ContentSection.findOne({ _id: contentSectionId, status: "active" }).lean();

    if (!contentSection) {
      return res.status(404).json({ message: "Content section not found" });
    }

    // Fetch enrollment only if contentSection exists
    const enrollment = await Enrollment.findOne({
      course: contentSection.courseId,
      user: userId,
      status: "active",
    });

    // Check if user is the creator or has active enrollment
    if (!enrollment && contentSection.creatorId.toString() !== userId) {
      return res.status(403).json({ message: "Access denied. No active enrollment." });
    }

    // Modify content
    const modifiedContent = addUrls(contentSection);
    const isCreator=contentSection.creatorId.toString()==req.user.id.toString();
    const isEnrolled=enrollment?true:false;
    res.json({ success: true,message:"contentSection fetch successfully", contentSection: {...modifiedContent,isCreator,isEnrolled} });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const reorder = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    let { oldIndex, newIndex } = req.body;
    const userId = req.user.id;

    const updatedSection = await ContentSection.findOneAndUpdate(
      {
        _id: contentSectionId,
        creatorId: userId,
        status: "active",
        [`items.${oldIndex}`]: { $exists: true },
        [`items.${newIndex}`]: { $exists: true }
      },
      [
        {
          $set: {
            items: {
              $let: {
                vars: {
                  itemToMove: { $arrayElemAt: ["$items", oldIndex] },
                  filteredItems: {
                    $filter: {
                      input: "$items",
                      as: "item",
                      cond: { $ne: ["$$item", { $arrayElemAt: ["$items", oldIndex] }] }
                    }
                  }
                },
                in: {
                  $concatArrays: [
                    {
                      $cond: {
                        if: { $eq: [newIndex, 0] },
                        then: [],
                        else: { $slice: ["$$filteredItems", 0, newIndex] }
                      }
                    },
                    ["$$itemToMove"],
                    {
                      $cond: {
                        if: { $eq: [newIndex, { $size: "$$filteredItems" }] },
                        then: [],
                        else: {
                          $slice: [
                            "$$filteredItems",
                            newIndex,
                            { $subtract: [{ $size: "$$filteredItems" }, newIndex] }
                          ]
                        }
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      ],
      { new: true }
    );

    if (!updatedSection) {
      return res.status(403).json({ message: "Failed to reorder items" });
    }

    res.status(200).json({
      message: "Items reordered successfully",
      items: updatedSection.items
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = { reorder,getContent };
