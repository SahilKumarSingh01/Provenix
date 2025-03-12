const ContentSection = require("../../models/ContentSection");

const create = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    const creatorId = req.user.id;

    // Find the parent content section (to copy values)
    const parentContentSection = await ContentSection.findOne(
      { _id: contentSectionId, creatorId },
      { pageId: 1, section: 1, courseId: 1, creatorId: 1 } // Fetch only required fields
    );

    if (!parentContentSection) {
      return res.status(404).json({ message: "Parent content section not found or unauthorized" });
    }

    // Create a new content section
    const newContentSection = await ContentSection.create({
      pageId: parentContentSection.pageId,
      section: parentContentSection.section,
      courseId: parentContentSection.courseId,
      creatorId: parentContentSection.creatorId,
      items: [],
      parentContent: contentSectionId, // Link back to the parent section
    });

    // New hidden item
    const newItem = {
      type: "hidden",
      data: { name: "Edit name here...", contentSectionId: newContentSection._id }
    };

    // Push the hidden item into the parent content section
    await ContentSection.updateOne(
      { _id: contentSectionId },
      { $push: { items: newItem } }
    );

    res.status(201).json({
      success: true,
      message: "Hidden section created successfully",
      item: newItem, // Return newItem instead of just ID
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { contentSectionId, itemId } = req.params;
    const { name } = req.body;
    const creatorId = req.user.id;

    // Ensure the content section exists and belongs to the user
    const contentSection = await ContentSection.findOne(
      { _id: contentSectionId, creatorId },
      { _id: 1 } // Fetch only _id for efficiency
    );

    if (!contentSection) {
      return res.status(404).json({ message: "Content section not found or unauthorized" });
    }

    // Update the hidden section name
    const result = await ContentSection.updateOne(
      { _id: contentSectionId, "items._id": itemId, "items.type": "hidden" },
      { $set: { "items.$.data.name": name } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Hidden section not found" });
    }

    res.json({ success: true, message: "Hidden section updated successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const { contentSectionId, itemId } = req.params;
    const creatorId = req.user.id;

    // Find the parent ContentSection and extract the hidden item
    const parentContentSection = await ContentSection.findOne(
      { _id: contentSectionId, creatorId, "items._id": itemId, "items.type": "hidden" },
      { "items.$": 1 }
    );

    if (!parentContentSection) {
      return res.status(404).json({ message: "Hidden section not found or unauthorized" });
    }

    // Extract the linked contentSectionId from the hidden item
    const hiddenItem = parentContentSection.items[0];
    const hiddenContentSectionId = hiddenItem.data.contentSectionId;

    if (!hiddenContentSectionId) {
      return res.status(400).json({ message: "Invalid hidden section reference" });
    }

    // Use $graphLookup to find all descendants of the hidden content section
    const relatedSections = await ContentSection.aggregate([
      {
        $match: { _id: hiddenContentSectionId }
      },
      {
        $graphLookup: {
          from: "contentsections", // Collection name (ensure it matches the actual collection name)
          startWith: "$_id",
          connectFromField: "_id",
          connectToField: "parentContent",
          as: "descendants"
        }
      },
      {
        $project: {
          allSections: { $concatArrays: [["$_id"], "$descendants._id"] }
        }
      }
    ]);

    if (!relatedSections.length) {
      return res.status(400).json({ message: "No related sections found" });
    }

    const sectionIdsToDelete = relatedSections[0].allSections;

    // Update all found sections to status "deleted"
    await ContentSection.updateMany(
      { _id: { $in: sectionIdsToDelete }, status: "active" },
      { $set: { status: "deleted" } }
    );

    // Remove the hidden section from the parent content section's items array
    await ContentSection.updateOne(
      { _id: contentSectionId },
      { $pull: { items: { _id: itemId, type: "hidden" } } }
    );

    res.json({ success: true, message: "Hidden section marked as deleted" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { create, update ,remove};
