const OrphanResource = require("../../models/OrphanResource");
const ContentSection = require("../../models/ContentSection");
const Enrollment = require("../../models/Enrollment");
const sanitizeMcqData=require('../../utils/sanitizeMcqData');

const create = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    const creatorId = req.user.id;

    // Default MCQ template
    const mcqTemplate = {
      type: "mcq",
      data: {
        ques: { text: "Double click to open editing menu..." ,publicId:"",url:""},
        options: [
          { text: "Write option here..." ,publicId:"",url:""},
          { text: "Write option here...",publicId:"",url:"" }
        ],
      },
    };

    // Add MCQ template to content section
    const updatedSection = await ContentSection.findOneAndUpdate(
      { _id: contentSectionId, creatorId, status: "active" },
      { $push: { items: mcqTemplate } },
      { new: true } // Return only the newly added item
    );

    if (!updatedSection) {
      return res.status(404).json({ message: "Content section not found or unauthorized" });
    }

    res.status(201).json({
      success: true,
      message: "MCQ template added successfully",
      items: updatedSection.items,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const update = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    const { itemId, courseId } = req.body;
    const creatorId = req.user.id;

    const data = sanitizeMcqData(req.body.data);

    // Step 1: Check enrollment
    const activeEnrollmentExists = await Enrollment.exists({ course: courseId, status: "active" });
    if (activeEnrollmentExists) {
      return res.status(403).json({ message: "Modification not allowed. Active enrollments exist." });
    }

    // Step 2: Update and get old version
    const fetchedSection = await ContentSection.findOneAndUpdate(
      {
        _id: contentSectionId,
        creatorId,
        status: "active",
        items: { $elemMatch: { _id: itemId, type: "mcq" } },
      },
      { $set: { "items.$.data": data } },
      { new: false }
    );

    if (!fetchedSection) {
      return res.status(500).json({ message: "Failed to update MCQ item." });
    }

    // Step 3: Extract old & new publicIds
    const oldMcq = fetchedSection.items.find((item) => item._id.toString() === itemId)?.data;

    const getPublicIds = (mcq) => {
      const ids = [];
      if (mcq?.ques?.publicId) ids.push(mcq.ques.publicId);
      mcq?.options?.forEach(opt => {
        if (opt?.publicId) ids.push(opt.publicId);
      });
      return ids;
    };

    const oldPublicIds = getPublicIds(oldMcq);
    const newPublicIds = getPublicIds(data);
    
    const orphanIds = oldPublicIds.filter(id => !newPublicIds.includes(id));
    const adoptedIds = newPublicIds.filter(id => !oldPublicIds.includes(id));
    // Step 4: Delete orphan entries
    const deletionResult = await OrphanResource.deleteMany({
      publicId: { $in: adoptedIds },
      type: "image",
      category: "pagePhoto",
    });

    // Step 5: Add adopted entries
    if (orphanIds.length) {
        await OrphanResource.insertMany(
          orphanIds.map((publicId) => ({ publicId, type: "image", category: "pagePhoto" })))
    }

    const items = fetchedSection.items.map((item) =>
      item._id.toString() === itemId ? { ...item, data } : item
    );

    // Step 6: Check for mismatch and respond
    if (deletionResult.deletedCount !== adoptedIds.length) {
      return res.status(200).json({
        success: true,
        message: "MCQ updated, but some in-use images were deleted from DB. Please update them or broken images may appear.",
        items,
      });
    }

    res.json({success: true,message: "MCQ item updated successfully",items});

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




const remove = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    const { itemId, courseId } = req.query;
    const creatorId = req.user.id;

    const enrollmentExists = await Enrollment.exists({ course: courseId, status: "active" });
    if (enrollmentExists) {
      return res.status(403).json({ message: "Modification not allowed. Active enrollments exist." });
    }

    const section = await ContentSection.findOneAndUpdate(
      {
        _id: contentSectionId,
        creatorId,
        status: "active",
        items: { $elemMatch: { _id: itemId, type: "mcq" } },
      },
      { $pull: { items: { _id: itemId } } },
      { new: false }
    );

    if (!section) {
      return res.status(404).json({ message: "MCQ not found or unauthorized" });
    }

    const itemIndex = section.items.findIndex(item => item._id.toString() === itemId && item.type === "mcq");
    const oldMcq = section.items[itemIndex]?.data;
    const publicIds = [];

    if (oldMcq?.ques?.publicId) publicIds.push(oldMcq.ques.publicId);
    oldMcq?.options?.forEach(opt => {
      if (opt?.publicId) publicIds.push(opt.publicId);
    });

    if (publicIds.length) {
      try {
        await OrphanResource.insertMany(
          publicIds.map(publicId => ({ publicId, type: "image", category: "pagePhoto" })),
          { ordered: false }
        );
      } catch (err) {
        if (!err.writeErrors?.every(e => e.code === 11000)) throw err;
      }
    }

    // Clean up from memory too (just in case)
    section.items.splice(itemIndex, 1);

    res.json({
      success: true,
      message: "MCQ removed successfully",
      items: section.items,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



module.exports = { create ,update,remove};
