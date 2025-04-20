const ContentSection = require("../../models/ContentSection");
const canEditText = require("../../utils/canEditText");
const Enrollment = require("../../models/Enrollment");

const create = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    const creatorId = req.user.id;

    // Find the parent content section (to copy values)
    const parentContentSection = await ContentSection.findOne(
      { _id: contentSectionId, creatorId, status: "active" },
      { pageId: 1, moduleId: 1, courseId: 1, creatorId: 1 } // Fetch only required fields
    );

    if (!parentContentSection) {
      return res.status(404).json({ message: "Parent content section not found or unauthorized" });
    }
    
    // Create a new content section
    const newContentSection = await ContentSection.create({
      pageId: parentContentSection.pageId,
      moduleId: parentContentSection.moduleId,
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

    // Push the hidden item into the parent content section and fetch the updated document
    const updatedSection = await ContentSection.findOneAndUpdate(
      { _id: contentSectionId },
      { $push: { items: newItem } },
      { new: true } // Return only the last added item
    );

    res.status(201).json({
      success: true,
      message: "Hidden section created successfully",
      items: updatedSection.items, // Return the last added item
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const update = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    const { data ,itemId,courseId} = req.body;
    const creatorId = req.user.id;
    const name=data.name;
    if (typeof name !== "string") {
      return res.status(400).json({ message: "Invalid input. name must be a string." });
    }

    // Check if the content section exists with status "active" and belongs to the user
    const [contentSection, activeEnrollment] = await Promise.all([
      ContentSection.findOne(
        { _id: contentSectionId, creatorId, status: "active", items: {$elemMatch: {_id: itemId,type: "hidden"}} },
        { "items.$": 1 } // Fetch only the matched item
      ),
      Enrollment.exists({ courseId, status: "active" })
    ]);

    if (!contentSection) {
      return res.status(404).json({ message: "Content section not found or unauthorized" });
    }

    const hiddenItem = contentSection.items[0].data;
    if (!hiddenItem) {
      return res.status(404).json({ message: "Hidden section not found" });
    }

    // Check edit restrictions if active enrollment exists
    if (activeEnrollment && !canEditText(hiddenItem.name, name)) {
      return res.status(403).json({ message: "Edit limit exceeded. Only minor changes allowed." });
    }

    // Update the hidden section name and fetch updated document
    const updatedSection = await ContentSection.findOneAndUpdate(
      { _id: contentSectionId, "items._id": itemId },
      { $set: { "items.$.data.name": name } },
      { new: true } // Return only the updated item
    );

    if (!updatedSection) {
      return res.status(500).json({ message: "Failed to update hidden section" });
    }

    res.json({
      success: true,
      message: "Hidden section updated successfully",
      items: updatedSection.items,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    const { itemId ,courseId} = req.query;
    const creatorId = req.user.id;
     // Check active enrollments first
    // Check if the content section exists with status "active" and belongs to the user
    const [parentContentSection, activeEnrollment] = await Promise.all([
      ContentSection.findOne(
        { _id: contentSectionId, creatorId, status: "active", items: {$elemMatch: {_id: itemId,type: "hidden"}} },
        { "items.$": 1 } // Fetch only the matched item
      ),
      Enrollment.exists({ courseId, status: "active" })
    ]);

    if (activeEnrollment) {
      return res.status(403).json({ message: "Modification not allowed. Active enrollments exist." });
    }

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

    // Update all found sections to status "deleted" and remove the hidden section concurrently
    const[updatedSection,result]=await Promise.all([
      ContentSection.findOneAndUpdate(
        { _id: contentSectionId },
        { $pull: { items: { _id: itemId, type: "hidden" } } },
        {new:true},
      ),

      ContentSection.updateMany(
        { _id: { $in: sectionIdsToDelete }, status: "active" },
        { $set: { status: "deleted" } }
      ),
      
    ]);
    res.json({
      success: true,
      message: `${result.modifiedCount} Hidden section marked as deleted`,
      items: updatedSection.items,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { create, update ,remove};
