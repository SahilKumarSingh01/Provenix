const OrphanResource = require("../../models/OrphanResource");
const ContentSection = require("../../models/ContentSection");
const Enrollment = require("../../models/Enrollment");
const extractPublicId = require("../../utils/extractPublicId");
const cloudinary = require("../../config/cloudinary");
const Course = require("../../models/Course");

const VIDEO_EXPIRY_TIME = 5*60 * 60; // 1 hour or however long you want

const create = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    const creatorId = req.user.id;

    const updatedSection = await ContentSection.findOneAndUpdate(
      { _id: contentSectionId, creatorId, status: "active" },
      { $push: { items: { type: "video", data: { publicId: "" } } } },
      { new: true }
    );

    if (!updatedSection)
      return res.status(404).json({ message: "Content section not found or unauthorized" });

    res.status(201).json({
      success: true,
      message: "Video added successfully",
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
    const { publicId } = data;
    const creatorId = req.user.id;

    if (typeof publicId !== "string") {
      return res.status(400).json({ message: "Invalid data type for url" });
    }

    const newPublicId = publicId;

    const [activeEnrollmentExists, deletionResult] = await Promise.all([
      Enrollment.exists({ course: courseId, status: "active" }),
      OrphanResource.deleteOne({ publicId: newPublicId, type: "video", category: "pageVideo" }),
    ]);

    if (activeEnrollmentExists) {
      await OrphanResource.create({ publicId: newPublicId, type: "video", category: "pageVideo" });
      return res.status(403).json({ message: "Modification not allowed. Active enrollments exist." });
    }

    if (deletionResult.deletedCount === 0) {
      return res.status(400).json({ message: "Orphan entry not found or already used." });
    }

    const fetchedSection = await ContentSection.findOneAndUpdate(
      {
        _id: contentSectionId,
        creatorId,
        status: "active",
        items: { $elemMatch: { _id: itemId, type: "video" } },
      },
      { $set: { "items.$.data": { publicId: newPublicId } } },
      { new: false }
    );

    if (!fetchedSection) {
      await OrphanResource.create({ publicId: newPublicId, type: "video", category: "pageVideo" });
      return res.status(500).json({ message: "Failed to update video." });
    }

    const itemIndex = fetchedSection.items.findIndex((item) => item._id.toString() === itemId);
    const oldPublicId = fetchedSection.items[itemIndex]?.data?.publicId;

    fetchedSection.items[itemIndex].data = { publicId: newPublicId };

    if (oldPublicId && oldPublicId !== newPublicId) {
      await OrphanResource.create({ publicId: oldPublicId, type: "video", category: "pageVideo" });
    }
    let course={};
    if(!oldPublicId)//first time video upload
    {
      course= await Course.findOneAndUpdate(
            { _id: fetchedSection.courseId },
            { $inc: { videoCount: 1 } },
            { new: true, lean: true }
          ).select("videoCount");
    }

    res.json({
      success: true,
      message: "Video updated successfully",
      items: fetchedSection.items,
      videoCount:course?.videoCount,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const refreshUrl = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    const { itemId, courseId } = req.query;
    const userId = req.user.id;

    // Fetch the content section without filtering by creator
    const section = await ContentSection.findOne({
      _id: contentSectionId,
      status: "active",
      items: { $elemMatch: { _id: itemId, type: "video" } }
    });

    if (!section) {
      return res.status(404).json({ message: "Content section or video not found." });
    }

    // Check enrollment (if buyer)
    const isEnrolled = await Enrollment.exists({ course: courseId, user: userId, status: "active" });

    const isCreator = section.creatorId.toString() === userId;

    if (!isCreator && !isEnrolled) {
      return res.status(403).json({ message: "Unauthorized to access video URL." });
    }

    const item = section.items.find((i) => i._id.toString() === itemId && i.type === "video");
    if (!item || !item.data?.publicId) {
      return res.status(404).json({ message: "Video item or publicId missing." });
    }

    const url = cloudinary.utils.private_download_url(item.data.publicId, "mp4", {
        resource_type: "video",
        type: "authenticated", // matches the uploaded asset type
        expires_at: Math.floor(Date.now() / 1000) +VIDEO_EXPIRY_TIME,// VIDEO_EXPIRY_TIME, // expires in 10 seconds
    });

    res.json({ success: true, url });

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
        items: { $elemMatch: { _id: itemId, type: "video" } },
      },
      { $pull: { items: { _id: itemId } } },
      { new: false }
    );

    if (!section) {
      return res.status(404).json({ message: "Video not found or unauthorized" });
    }

    const itemIndex = section.items.findIndex(item => item._id.toString() === itemId && item.type === "video");
    const { publicId } = section.items[itemIndex].data;

    section.items.splice(itemIndex, 1);

    await OrphanResource.create({ publicId, type: "video", category: "pageVideo" });
    const course= await Course.findOneAndUpdate(
      { _id: section.courseId },
      { $inc: { videoCount: -1 } },
      { new: true, lean: true }
    ).select("videoCount");

    res.json({
      success: true,
      message: "Video removed successfully",
      items: section.items,
      videoCount:course.videoCount,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
 
module.exports = { create, refreshUrl,update, remove };
