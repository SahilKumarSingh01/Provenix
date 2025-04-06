const ContentSection = require("../../models/ContentSection");
const canEditText = require("../../utils/canEditText");
const Enrollment = require("../../models/Enrollment");

const create = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    const creatorId = req.user.id;

    const newItem = {
      type: "reference",
      data: {
        title: "add title here...",
        url: "paste url here...",
        platform: "Platform name...",
        difficulty: "Easy",
      },
    };

    const updatedSection = await ContentSection.findOneAndUpdate(
      { _id: contentSectionId, creatorId, status: "active" },
      { $push: { items: newItem } },
      { new: true } // Return only the last added item
    );

    if (!updatedSection) {
      return res.status(400).json({ message: "Update failed. Content section may not exist or is unauthorized." });
    }

    res.status(201).json({
      success: true,
      message: "Reference added successfully",
      items: updatedSection.items, // Return the newly added item
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const update = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    const {itemId, data, courseId} = req.body;
    const { title, url, platform, difficulty}=data;
    const creatorId = req.user.id;
    // Ensure all fields are strings
    if (![title, url, platform, difficulty].every((field) => typeof field === "string")) {
      return res.status(400).json({ message: "All fields must be of type string" });
    }

    // Fetch old data and check active enrollment in a single batch query
   const [contentSection, activeEnrollment] = await Promise.all([
         ContentSection.findOne(
           {_id: contentSectionId, creatorId, courseId,items: { $elemMatch: { _id: itemId, type: "reference" } }},
           {"items.$": 1}
         ),
         Enrollment.exists({
           course: courseId,
           status: "active"
         })
       ]);

    if (!contentSection) {
      return res.status(404).json({ message: "Reference not found or unauthorized" });
    }

    const oldData = contentSection.items[0].data;
    const oldText = `${oldData.title} ${oldData.platform} ${oldData.difficulty}`;
    const newText = `${title} ${platform} ${difficulty}`;

    // If active enrollment exists, apply edit restrictions
    if (activeEnrollment && !canEditText(oldText, newText)) {
      return res.status(403).json({ message: "Edit limit exceeded. Only minor changes allowed." });
    }

    const newData = { title, url, platform, difficulty };

    // Perform the update and return the updated item
    const updatedSection = await ContentSection.findOneAndUpdate(
      { _id: contentSectionId, creatorId, "items._id": itemId },
      { $set: { "items.$.data": newData } },
      { new: true } // Return only the updated item
    );

    if (!updatedSection) {
      return res.status(404).json({ message: "Update failed. No changes were made." });
    }

    res.json({
      success: true,
      message: "Reference updated successfully",
      items: updatedSection.items // Return the updated item
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

    // Check for active enrollments
    const activeEnrollment = await Enrollment.exists({ course: courseId, status: "active" });
    if (activeEnrollment) {
      return res.status(403).json({ message: "Cannot remove reference. Active enrollments exist." });
    }

    const updatedSection = await ContentSection.findOneAndUpdate(
          { _id: contentSectionId, creatorId, status: "active", items: { $elemMatch: { _id: itemId, type: "reference" } } },
          { $pull: { items: { _id: itemId, type: "reference" } } },
          { new: true }
        );
    
      if (!updatedSection) {
        return res.status(404).json({ message: "Content section or item not found" });
      }
  
      res.status(200).json({
        success: true,
        message: "Reference removed successfully",
        items: updatedSection.items,
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



module.exports = { create, update, remove };
