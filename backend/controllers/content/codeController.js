const ContentSection = require("../../models/ContentSection");

// Create a new code block inside items[]
const create = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    const creatorId = req.user.id;

    const contentSection = await ContentSection.findOne(
      { _id: contentSectionId, creatorId },
      { _id: 1 }
    );

    if (!contentSection) {
      return res.status(404).json({ message: "Content section not found or unauthorized" });
    }

    const newItem = { type: "code", data: [] };
    await ContentSection.updateOne(
      { _id: contentSectionId },
      { $push: { items: newItem } }
    );

    res.status(201).json({ success: true, message: "Code block added successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove a full code block from items[]
const remove = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    const { itemId } = req.body;
    const creatorId = req.user.id;

    const contentSection = await ContentSection.findOne(
      { _id: contentSectionId, creatorId },
      { _id: 1 }
    );

    if (!contentSection) {
      return res.status(404).json({ message: "Content section not found or unauthorized" });
    }

    const result = await ContentSection.updateOne(
      { _id: contentSectionId },
      { $pull: { items: { _id: itemId, type: "code" } } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Code block not found" });
    }

    res.json({ success: true, message: "Code block removed successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Push a new language entry inside a code block
const push = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    const { itemId,lang, code } = req.body;
    const creatorId = req.user.id;

    const contentSection = await ContentSection.findOne(
      { _id: contentSectionId, creatorId },
      { _id: 1 }
    );

    if (!contentSection) {
      return res.status(404).json({ message: "Content section not found or unauthorized" });
    }

    const result = await ContentSection.updateOne(
      { _id: contentSectionId, "items._id": itemId, "items.type": "code" },
      { $push: { "items.$.data": { lang, code } } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Code block not found" });
    }

    res.json({ success: true, message: "New language added successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Edit an existing language entry inside a code block
const edit = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    const { itemId, index, lang, code } = req.body;
    const creatorId = req.user.id;

    const contentSection = await ContentSection.findOne(
      { _id: contentSectionId, creatorId },
      { _id: 1 }
    );

    if (!contentSection) {
      return res.status(404).json({ message: "Content section not found or unauthorized" });
    }

    const result = await ContentSection.updateOne(
      { _id: contentSectionId, "items._id": itemId, "items.type": "code" },
      { 
        $set: {
          [`items.$.data.${index}.lang`]: lang,
          [`items.$.data.${index}.code`]: code
        } 
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Code entry not found" });
    }

    res.json({ success: true, message: "Code updated successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Pull (delete) a language entry from a code block
const pull = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    const {itemId, index } = req.body;
    const creatorId = req.user.id;

    const contentSection = await ContentSection.findOne(
      { _id: contentSectionId, creatorId },
      { _id: 1 }
    );

    if (!contentSection) {
      return res.status(404).json({ message: "Content section not found or unauthorized" });
    }

    const result = await ContentSection.updateOne(
      { _id: contentSectionId, "items._id": itemId, "items.type": "code" },
      { 
        $unset: { [`items.$.data.${index}`]: 1 }
      }
    );

    // Clean up null values left by $unset
    await ContentSection.updateOne(
      { _id: contentSectionId, "items._id": itemId, "items.type": "code" },
      { 
        $pull: { "items.$.data": null }
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Code entry not found" });
    }

    res.json({ success: true, message: "Code language deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { create, remove, push, edit, pull };
