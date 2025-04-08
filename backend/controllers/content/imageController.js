const OrphanResource = require("../../models/OrphanResource");
const ContentSection = require("../../models/ContentSection");
const Enrollment = require("../../models/Enrollment");
const extractPublicId=require('../../utils/extractPublicId');

const IMAGE_EXPIRY_TIME = 5 * 60 * 60;


const create = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    const creatorId = req.user.id;
    const updatedSection = await ContentSection.findOneAndUpdate(
      { _id: contentSectionId, creatorId, status: "active" },
      { $push: { items: { type: "image", data: { url:""} } }},
      { new: true } 
    );

    if (!updatedSection) 
      return res.status(404).json({ message: "Content section not found or unauthorized" });

    res.status(201).json({success: true,message: "Image added successfully",items:updatedSection.items});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const update = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    const { itemId, data, courseId } = req.body;
    const { url } = data;
    const creatorId = req.user.id;

    if (typeof url !== "string") {
      return res.status(400).json({ message: "Invalid data type for url" });
    }

    const newPublicId = extractPublicId(url);

    const [activeEnrollmentExists, deletionResult] = await Promise.all([
      Enrollment.exists({ course: courseId, status: "active" }),
      OrphanResource.deleteOne({ publicId: newPublicId, type: "image", category: "pagePhoto" })
    ]);

    if (activeEnrollmentExists) {
      await OrphanResource.create({ publicId: newPublicId, type: "image", category: "pagePhoto" });
      return res.status(403).json({ message: "Modification not allowed. Active enrollments exist." });
    }

    if (deletionResult.deletedCount === 0) {
      return res.status(400).json({ message: "Orphan entry not found or already used." });
    }

    const fetchedSection = await ContentSection.findOneAndUpdate(
      {_id: contentSectionId,creatorId,status:"active",items: { $elemMatch: { _id: itemId, type: "image" } }},
      {$set: { "items.$.data": { publicId: newPublicId, url } }},
      { new: false }
    );

    if (!fetchedSection) {
      await OrphanResource.create({ publicId: newPublicId, type: "image", category: "pagePhoto" });
      return res.status(500).json({ message: "Failed to update image." });
    }

    const itemIndex = fetchedSection.items.findIndex((item) => item._id.toString() === itemId);
    const oldPublicId = fetchedSection.items[itemIndex]?.data?.publicId;
    fetchedSection.items[itemIndex].data = { publicId: newPublicId, url };

    if (oldPublicId && oldPublicId !== newPublicId) {
      await OrphanResource.create({ publicId: oldPublicId, type: "image", category: "pagePhoto" });
    }
    res.json({success: true,message: "Image updated successfully",items: fetchedSection.items});

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};






const remove = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    const { itemId,courseId } = req.query;
    const creatorId = req.user.id;

    const enrollmentExists = await Enrollment.exists({ course: courseId, status: "active" });
    if (enrollmentExists) {
      return res.status(403).json({ message: "Modification not allowed. Active enrollments exist." });
    }

    const section = await ContentSection.findOneAndUpdate(
      { _id: contentSectionId, creatorId,status:"active", items: { $elemMatch: { _id: itemId, type: "image" } }, },
      { $pull: { items: { _id: itemId } } },
      { new: false }
    );
    const itemIndex = section.items.findIndex(item => item._id.toString() === itemId && item.type === "image");

    if (!section) {
      return res.status(404).json({ message: "Image not found or unauthorized" });
    }
    
    const { publicId } = section.items[itemIndex].data;
    section.items.splice(itemIndex, 1);

    await OrphanResource.create({ publicId, type: "image", category: "pagePhoto" });

    res.json({ success: true, message: "Image removed successfully", items: section.items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



module.exports = { create ,update,remove};
