const OrphanResource = require("../../models/OrphanResource");
const ContentSection = require("../../models/ContentSection");
const Enrollment = require("../../models/Enrollment");
const cloudinary = require("../../config/cloudinary");
const Course = require("../../models/Course");

const VIDEO_EXPIRY_TIME = 5 * 60 * 60; // 5 hours

const create = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    const { publicId } = req.body;
    const creatorId = req.user.id;

    if (typeof publicId !== "string") {
      return res.status(400).json({ message: "Invalid data type for publicId" });
    }

    // Push the new video item and return the updated section
    const updatedSection = await ContentSection.findOneAndUpdate(
      { _id: contentSectionId, creatorId, status: "active" },
      { $push: { items: { type: "video", data: { publicId } } } },
      { new: true, projection: { "items.$": 1 ,courseId: 1} } // Return only the newly added item
    );

    if (!updatedSection) {
      return res.status(404).json({ message: "Content section not found or unauthorized" });
    }

    const newItem = updatedSection.items[0]; // Store the added item

    // Attempt to delete the orphan resource after successful update
    const deleteResult = await OrphanResource.deleteOne({ publicId, type: "video", category: "pageVideo" });

    if (deleteResult.deletedCount === 0) {
      // Cleanup: Remove the added item from ContentSection since orphan deletion failed
      await ContentSection.updateOne(
        { _id: contentSectionId, "items._id": newItem._id },
        { $pull: { items: { _id: newItem._id } } }
      );

      return res.status(400).json({ message: "File might have been deleted. Please try reuploading it." });
    }

    await Course.updateOne({ _id: updatedSection.courseId }, { $inc: { videoCount: 1 } });


    // Generate a temporary signed URL (valid for VIDEO_EXPIRY_TIME seconds)
    const url = cloudinary.utils.signed_url(publicId, {
      type: "authenticated",
      resource_type: "video",
      format: "mp4",
      expires_at: Math.floor(Date.now() / 1000) + VIDEO_EXPIRY_TIME,
    });
    newItem.data.url = url;

    res.status(201).json({ success: true, message: "Video added successfully", newItem});

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const refreshUrl = async (req, res) => {
  try {
    const { contentSectionId, courseId } = req.params;
    const { itemId } = req.body;
    const userId = req.user.id;

    // Check if user is creator or enrolled
    const [contentSection, isEnrolled] = await Promise.all([
      ContentSection.findOne(
        { _id: contentSectionId, "items._id": itemId, "items.type": "video", status: "active" },
        { "items.$": 1, creatorId: 1 }
      ),
      Enrollment.exists({ course: courseId, user: userId, status: "active" })
    ]);

    if (!contentSection || (!contentSection.creatorId.equals(userId) && !isEnrolled)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const publicId = contentSection.items[0].data.publicId;
    const url = cloudinary.utils.signed_url(publicId, {
      type: "authenticated",
      resource_type: "video",
      format: "mp4",
      expires_at: Math.floor(Date.now() / 1000) + VIDEO_EXPIRY_TIME,
    });

    res.json({ success: true, message: "URL refreshed", url });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const update = async (req, res) => {
  try {
    const { contentSectionId, courseId } = req.params;
    const { itemId, publicId } = req.body;
    const creatorId = req.user.id;

    // Validate input types
    if (typeof publicId !== "string") {
      return res.status(400).json({ message: "Invalid data type for publicId" });
    }

    // Run all queries in parallel for better performance
    const [orphanExists, activeEnrollmentExists, contentSection] = await Promise.all([
      OrphanResource.exists({ publicId, type: "video", category: "pageVideo" }),
      Enrollment.exists({ course: courseId, status: "active" }),
      ContentSection.findOne(
        { _id: contentSectionId, creatorId, "items._id": itemId, "items.type": "video", status: "active" },
        { "items.$": 1 }
      ),
    ]);

    if (!contentSection) {
      return res.status(404).json({ message: "Video not found or unauthorized" });
    }

    const existingItem = contentSection.items[0];

    // Ensure orphan resource exists if publicId is changing
    if (existingItem.data.publicId !== publicId && !orphanExists) {
      return res.status(400).json({ message: "Invalid request. New publicId not found in orphan resources." });
    }

    if (activeEnrollmentExists) {
      return res.status(403).json({ message: "Modification not allowed. Active enrollments exist." });
    }

    // Run updates in parallel
    const [updatedSection] = await Promise.all([
      // Update the video data
      ContentSection.findOneAndUpdate(
        { _id: contentSectionId, "items._id": itemId },
        { $set: { "items.$.data": { publicId } } },
        { new: true, projection: { "items.$": 1 } }
      ),

      // Manage orphan resources if publicId has changed
      existingItem.data.publicId !== publicId
        ? OrphanResource.bulkWrite([
            { insertOne: { document: { publicId: existingItem.data.publicId, type: "video", category: "pageVideo" } } },
            { deleteOne: { filter: { publicId, type: "video", category: "pageVideo" } } },
          ])
        : Promise.resolve({ result: "No changes" }),
    ]);

    // Generate a signed URL with expiration
    const url = cloudinary.utils.signed_url(publicId, {
      type: "authenticated",
      resource_type: "video",
      format: "mp4",
      expires_at: Math.floor(Date.now() / 1000) + VIDEO_EXPIRY_TIME,
    });

    const newItem=updatedSection.items[0];
    
    newItem.data.url = url;
    res.json({success: true,message: "Video updated successfully",newItem});

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const remove = async (req, res) => {
  try {
    const { contentSectionId, courseId } = req.params;
    const { itemId } = req.body;
    const creatorId = req.user.id;

    const [activeEnrollmentExists, contentSection] = await Promise.all([
      Enrollment.exists({ course: courseId, status: "active" }),
      ContentSection.findOne(
        { _id: contentSectionId, creatorId, "items._id": itemId, "items.type": "video" },
        { "items.$": 1 }
      ),
    ]);

    if (!contentSection) {
      return res.status(404).json({ message: "Video not found or unauthorized" });
    }

    if (activeEnrollmentExists) {
      return res.status(403).json({ message: "Modification not allowed. Active enrollments exist." });
    }

    const existingItem = contentSection.items[0];

    await Promise.all([
      ContentSection.updateOne(
        { _id: contentSectionId },
        { $pull: { items: { _id: itemId } } }
      ),
      OrphanResource.create({
        publicId: existingItem.data.publicId,
        type: "video",
        category: "pageVideo"
      }),
      Course.updateOne({ _id: courseId ,creator:creatorId}, { $inc: { videoCount: -1 } }) // Decrement video count
    ]);

    res.json({ success: true, message: "Video removed successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { create, refreshUrl, update, remove };
