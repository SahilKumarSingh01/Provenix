const ContentSection = require("../../models/ContentSection");
const canEditText = require("../../utils/canEditText");
const Enrollment = require("../../models/Enrollment");

const create = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    const creatorId = req.user.id;
    // New heading item
    const newItem = { type: "heading", data: "double click to edit heading..." };

    // Find and update the document while returning the last added item
    const updatedSection = await ContentSection.findOneAndUpdate(
      { _id: contentSectionId, creatorId, status: "active" },
      { $push: { items: newItem } },
      { new: true, projection: { "items": { $slice: -1 } } } // Return only the last item
    );

    if (!updatedSection || !updatedSection.items.length) {
      return res.status(400).json({ message: "Update failed. Content section may not exist or is unauthorized." });
    }

    res.status(201).json({
      success: true,
      message: "Heading added successfully",
      newItem: updatedSection.items[0], // Send only the last added item
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const update = async (req, res) => {
  try {
    const { contentSectionId, courseId } = req.params;
    const { itemId, data } = req.body;
    const creatorId = req.user.id;

    if (typeof data !== "string") {
      return res.status(400).json({ message: "Invalid input. Text must be a string." });
    }

    // Check content section existence, status & active enrollment
    const [contentSection, activeEnrollment] = await Promise.all([
      ContentSection.findOne(
        { _id: contentSectionId, creatorId, status: "active", "items._id": itemId, "items.type": "heading" },
        { "items.$": 1 }
      ),
      Enrollment.exists({ course: courseId, status: "active" })
    ]);

    if (!contentSection) {
      return res.status(404).json({ message: "Content section not found or unauthorized" });
    }

    const oldData = contentSection.items[0].data;

    // If active enrollment exists, restrict text modification
    if (activeEnrollment && !canEditText(oldData, data)) {
      return res.status(403).json({ message: "Edit limit exceeded. Only minor changes allowed." });
    }

    // Find and update, returning the modified item
    const updatedSection = await ContentSection.findOneAndUpdate(
      { _id: contentSectionId, "items._id": itemId },
      { $set: { "items.$.data": data } },
      { new: true, projection: { "items.$": 1 } } // Returning only the modified item
    );

    if (!updatedSection) {
      return res.status(400).json({ message: "Update failed. No changes were made." });
    }

    res.json({
      success: true,
      message: "Heading updated successfully",
      newItem: updatedSection.items[0], // Sending only the updated item
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const remove = async (req, res) => {
  try {
    const { contentSectionId, courseId } = req.params;
    const { itemId } = req.body;
    const creatorId = req.user.id;

    // Check active enrollments first
    const activeEnrollment = await Enrollment.exists({ course: courseId, status: "active" });
    if (activeEnrollment) {
      return res.status(403).json({ message: "Cannot remove text. Active enrollments exist." });
    }

    // Perform removal directly
    const result = await ContentSection.updateOne(
      { _id: contentSectionId, creatorId, status: "active" },
      { $pull: { items: { _id: itemId, type: "heading" } } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Content section or item not found" });
    }

    res.json({ success: true, message: "Heading removed successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




module.exports = { create, update, remove };
