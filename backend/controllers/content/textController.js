const ContentSection = require("../../models/ContentSection");
const canEditText = require("../../utils/canEditText");
const Enrollment = require("../../models/Enrollment");

const create = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    const creatorId = req.user.id;
    // New text item
    const newItem = { type: "text", data: "Click to edit text..." };

    // Find and update the document while returning the last added item
    const updatedSection = await ContentSection.findOneAndUpdate(
      { _id: contentSectionId, creatorId, status: "active" },
      { $push: { items: newItem } },
      { new: true }
    );

    if (!updatedSection || !updatedSection.items.length) {
      return res.status(400).json({ message: "Update failed. Content section may not exist or is unauthorized." });
    }

    res.status(201).json({
      success: true,
      message: "Text added successfully",
      items: updatedSection.items,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const update = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    const { itemId, data, courseId } = req.body;
    const creatorId = req.user.id;

    if (typeof data !== "string") {
      return res.status(400).json({ message: "Invalid input. Text must be a string." });
    }

    // Check content section existence, status & active enrollment
    const [contentSection, activeEnrollment] = await Promise.all([
      ContentSection.findOne(
        {
          _id: contentSectionId, creatorId, courseId,
          items: { $elemMatch: { _id: itemId, type: "text" } }
        },
        {
          "items.$": 1
        }
      ),
      Enrollment.exists({
        course: courseId,
        status: "active"
      })
    ]);

    if (!contentSection) {
      return res.status(404).json({ message: "Content section not found or unauthorized" });
    }

    const oldData = contentSection.items[0].data;

    if (activeEnrollment && !canEditText(oldData, data)) {
      return res.status(403).json({ message: "Edit limit exceeded. Only minor changes allowed." });
    }

    // Find and update, returning the modified item
    const updatedSection = await ContentSection.findOneAndUpdate(
      { _id: contentSectionId, "items._id": itemId },
      { $set: { "items.$.data": data } },
      { new: true, projection: { "items": 1 } }
    );

    if (!updatedSection) {
      return res.status(400).json({ message: "Update failed. No changes were made." });
    }

    res.json({
      success: true,
      message: "Text updated successfully",
      items: updatedSection.items,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const remove = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    const { itemId, courseId } = req.query;
    const creatorId = req.user.id;

    const activeEnrollment = await Enrollment.exists({ course: courseId, status: "active" });
    if (activeEnrollment) {
      return res.status(403).json({ message: "Cannot remove text. Active enrollments exist." });
    }

    const updatedSection = await ContentSection.findOneAndUpdate(
      { _id: contentSectionId, creatorId, status: "active", items: { $elemMatch: { _id: itemId, type: "text" } } },
      { $pull: { items: { _id: itemId, type: "text" } } },
      { new: true }
    );

    if (!updatedSection) {
      return res.status(404).json({ message: "Content section or item not found" });
    }

    res.status(200).json({
      success: true,
      message: "Text removed successfully",
      items: updatedSection.items,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { create, update, remove };
