const ContentSection = require("../../models/ContentSection");

const create = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    const creatorId = req.user.id;

    // Find content section with only creatorId
    const contentSection = await ContentSection.findOne(
      { _id: contentSectionId, creatorId },
      { _id: 1 } // Fetch only _id for efficiency
    );

    if (!contentSection) {
      return res.status(404).json({ message: "Content section not found or unauthorized" });
    }

    // Push new text item with default text
    const newItem = { type: "text", data: { text: "Click to edit text..." } };
    await ContentSection.updateOne(
      { _id: contentSectionId },
      { $push: { items: newItem } }
    );

    res.status(201).json({ success: true, message: "Text added successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    const { itemId, data } = req.body;
    const creatorId = req.user.id;

    // Find content section with only creatorId
    const contentSection = await ContentSection.findOne(
      { _id: contentSectionId, creatorId },
      { _id: 1 } // Fetch only _id for efficiency
    );

    if (!contentSection) {
      return res.status(404).json({ message: "Content section not found or unauthorized" });
    }

    // Update specific text item
    const result = await ContentSection.updateOne(
      { _id: contentSectionId, "items._id": itemId, "items.type": "text" },
      { $set: { "items.$.data": data } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Text not found" });
    }

    res.json({ success: true, message: "Text updated successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const { contentSectionId, itemId } = req.params;
    const creatorId = req.user.id;

    // Ensure the content section exists and belongs to the user
    const contentSection = await ContentSection.findOne(
      { _id: contentSectionId, creatorId },
      { _id: 1 } // Fetch only _id for efficiency
    );

    if (!contentSection) {
      return res.status(404).json({ message: "Content section not found or unauthorized" });
    }

    // Remove only the matching text item from the array
    const result = await ContentSection.updateOne(
      { _id: contentSectionId },
      { $pull: { items: { _id: itemId, type: "text" } } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Text not found" });
    }

    res.json({ success: true, message: "Text removed successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { create, update, remove };
