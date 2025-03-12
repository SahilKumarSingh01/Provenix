const ContentSection = require("../../models/ContentSection");

const create = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    const { title, url, platform, difficulty } = req.body;
    const creatorId = req.user.id;

    const contentSection = await ContentSection.findOne(
      { _id: contentSectionId, creatorId },
      { _id: 1 }
    );
    if (!contentSection) return res.status(404).json({ message: "Content section not found or unauthorized" });

    const newItem = { type: "reference", data: { title, url, platform, difficulty } };
    await ContentSection.updateOne(
      { _id: contentSectionId },
      { $push: { items: newItem } }
    );

    res.status(201).json({ success: true, message: "Reference added successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    const { itemId, data } = req.body;
    const creatorId = req.user.id;

    const contentSection = await ContentSection.findOne(
      { _id: contentSectionId, creatorId },
      { _id: 1 }
    );
    if (!contentSection) return res.status(404).json({ message: "Content section not found or unauthorized" });

    const result = await ContentSection.updateOne(
      { _id: contentSectionId, "items._id": itemId, "items.type": "reference" },
      { $set: { "items.$.data": data } }
    );
    if (result.modifiedCount === 0) return res.status(404).json({ message: "Reference not found" });

    res.json({ success: true, message: "Reference updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const { contentSectionId, itemId } = req.params;
    const creatorId = req.user.id;

    const contentSection = await ContentSection.findOne(
      { _id: contentSectionId, creatorId },
      { _id: 1 }
    );
    if (!contentSection) return res.status(404).json({ message: "Content section not found or unauthorized" });

    const result = await ContentSection.updateOne(
      { _id: contentSectionId },
      { $pull: { items: { _id: itemId, type: "reference" } } }
    );
    if (result.modifiedCount === 0) return res.status(404).json({ message: "Reference not found" });

    res.json({ success: true, message: "Reference removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { create, update, remove };
