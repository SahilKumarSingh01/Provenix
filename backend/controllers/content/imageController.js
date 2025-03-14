const OrphanResource = require("../../models/OrphanResource");
const ContentSection = require("../../models/ContentSection");
const cloudinary = require("../../config/cloudinary");


const IMAGE_EXPIRY_TIME = 5 * 60 * 60;


const create = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    let { publicId, height, width } = req.body;
    const creatorId = req.user.id;

    if (typeof publicId !== "string" || isNaN(height = Number(height)) || isNaN(width = Number(width))) {
      return res.status(400).json({ message: "Invalid data type for publicId, height, or width" });
    }

    // Push the new image item and return the updated section
    const updatedSection = await ContentSection.findOneAndUpdate(
      { _id: contentSectionId, creatorId, status: "active" },
      { 
        $push: { 
          items: { 
            type: "image", 
            data: { publicId, height, width } 
          } 
        } 
      },
      { new: true, projection: { "items.$": 1 } } // Return only the newly added item
    );

    if (!updatedSection) {
      return res.status(404).json({ message: "Content section not found or unauthorized" });
    }

    const newItem = updatedSection.items[0]; // Store the added item

    // Attempt to delete the orphan resource after successful update
    const deleteResult = await OrphanResource.deleteOne({ publicId, type: "image", category: "pagePhoto" });

    if (deleteResult.deletedCount === 0) {
      // Cleanup: Remove the added item from ContentSection since orphan deletion failed
      await ContentSection.updateOne(
        { _id: contentSectionId, "items._id": newItem._id },
        { $pull: { items: { _id: newItem._id } } }
      );

      return res.status(400).json({ 
        message: "File might have been deleted. Please try reuploading it." 
      });
    }

    // Generate a temporary signed URL (valid for IMAGE_EXPIRY_TIME seconds)
    const url = cloudinary.utils.signed_url(publicId, {
      type: "authenticated",
      resource_type: "image",
      format: "webp",
      expires_at: Math.floor(Date.now() / 1000) + IMAGE_EXPIRY_TIME,
    });

    res.status(201).json({
      success: true,
      message: "Image added successfully",
      newItem,
      url // Temporary URL (not stored in DB)
    });

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
        { _id: contentSectionId, "items._id": itemId, "items.type": "image", status: "active" },
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
      resource_type: "image", // Ensure it's an image
      format: "webp", // Specify format explicitly if needed
      expires_at: Math.floor(Date.now() / 1000) + IMAGE_EXPIRY_TIME,
    });
    

    res.json({ success: true, message: "URL refreshed", url });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { contentSectionId, courseId } = req.params;
    let { itemId, publicId, height, width } = req.body;
    const creatorId = req.user.id;

    if (typeof publicId !== "string" || isNaN(height = Number(height)) || isNaN(width = Number(width))) {
      return res.status(400).json({ message: "Invalid data type for publicId, height, or width" });
    }

    // Run all queries in parallel to optimize DB calls
    const [orphanExists, activeEnrollmentExists, contentSection] = await Promise.all([
      OrphanResource.exists({ publicId, type: "image", category: "pagePhoto" }),
      Enrollment.exists({ course: courseId, status: "active" }),
      ContentSection.findOne(
        { _id: contentSectionId, creatorId, "items._id": itemId, "items.type": "image", status: "active" },
        { "items.$": 1 }
      ),
    ]);

    if (!contentSection) {
      return res.status(404).json({ message: "Image not found or unauthorized" });
    }
    
    const existingItem = contentSection.items[0];
    if ((existingItem.data.publicId !== publicId && !orphanExists)) {
      return res.status(400).json({ message: "Invalid request." });
    }
    
    if (activeEnrollmentExists) {
      return res.status(403).json({ message: "Modification not allowed. Active enrollments exist." });
    }
    


    // Run both updates in parallel using Promise.all and destructure results
    const [updatedSection] = await Promise.all([
      // Update the image data and return the updated item
      ContentSection.findOneAndUpdate(
        { _id: contentSectionId, "items._id": itemId },
        { $set: { "items.$.data": { publicId, height, width } } },
        { new: true, projection: { "items.$": 1 } } // Return only the updated item
      ),

      // Manage orphan resources if publicId has changed
      existingItem.data.publicId !== publicId
        ? OrphanResource.bulkWrite([
            { insertOne: { document: { publicId: existingItem.data.publicId, type: "image", category: "pagePhoto" } } },
            { deleteOne: { filter: { publicId, type: "image", category: "pagePhoto" } } },
          ])
        : Promise.resolve({ result: "No changes" }), // Return a dummy result to maintain consistency
    ]);

    // Generate a signed URL with expiration
    const url = cloudinary.utils.signed_url(publicId, {
      type: "authenticated",
      resource_type: "image",
      format: "webp",
      expires_at: Math.floor(Date.now() / 1000) + IMAGE_EXPIRY_TIME,
    });

    res.json({
      success: true,
      message: "Image updated successfully",
      newItem: updatedSection.items[0], // The updated item
      url,
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

    // Run both queries in parallel for efficiency
    const [activeEnrollmentExists, contentSection] = await Promise.all([
      Enrollment.exists({ course: courseId, status: "active" }),
      ContentSection.findOne(
        { _id: contentSectionId, creatorId, "items._id": itemId, "items.type": "image" },
        { "items.$": 1 } // Fetch the item before deletion
      ),
    ]);

    if (!contentSection) {
      return res.status(404).json({ message: "Image not found or unauthorized" });
    }

    if (activeEnrollmentExists) {
      return res.status(403).json({ message: "Modification not allowed. Active enrollments exist." });
    }

    const existingItem = contentSection.items[0];

    await Promise.all([
      // Remove the image item
      ContentSection.updateOne(
        { _id: contentSectionId },
        { $pull: { items: { _id: itemId } } }
      ),

      // Move the deleted image to OrphanResource
      OrphanResource.create({
        publicId: existingItem.data.publicId,
        type: "image",
        category: "pagePhoto"
      }),
    ]);

    res.json({ success: true, message: "Image removed successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = { create,refreshUrl ,update,remove};
