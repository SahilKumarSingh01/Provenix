const OrphanResource = require("../../models/OrphanResource");
const cloudinary = require("../../config/cloudinary");

const removeOrphanResource = async () => {
  try {
    const now = new Date();

    // Find orphan resources that have expired
    const orphanResources = await OrphanResource.find({ expiresAt: { $lte: now } });

    if (orphanResources.length === 0) {
      console.log("[CRON] No orphan resources to remove.");
      return;
    }

    // Group resources by type (image/video)
    const imageIds = [];
    const videoIds = [];

    orphanResources.forEach(({ publicId, type }) => {
      if (type === "video") videoIds.push(publicId);
      else imageIds.push(publicId);
    });

    // Bulk delete images
    if (imageIds.length > 0) {
      try {
        await cloudinary.api.delete_resources(imageIds, { resource_type: "image" });
        console.log(`[CRON] Removed ${imageIds.length} images from Cloudinary.`);
      } catch (error) {
        console.error("[CRON] Failed to delete images from Cloudinary:", error);
      }
    }

    // Bulk delete videos
    if (videoIds.length > 0) {
      try {
        await cloudinary.api.delete_resources(videoIds, { resource_type: "video" });
        console.log(`[CRON] Removed ${videoIds.length} videos from Cloudinary.`);
      } catch (error) {
        console.error("[CRON] Failed to delete videos from Cloudinary:", error);
      }
    }

    // Remove entries from the database
    await OrphanResource.deleteMany({ _id: { $in: orphanResources.map(({ _id }) => _id) } });

    console.log(`[CRON] Removed ${orphanResources.length} orphan resources.`);
  } catch (error) {
    console.error("[CRON] Error removing orphan resources:", error);
  }
};

module.exports = removeOrphanResource;
