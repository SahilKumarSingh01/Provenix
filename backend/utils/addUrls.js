const cloudinary = require("../config/cloudinary");

const IMAGE_EXPIRY_TIME = 60 * 60; // 1 hour
const VIDEO_EXPIRY_TIME = 2 * 60 * 60; // 2 hours

const addUrls = (contentSection) => {
  if (!contentSection || !contentSection.items) return contentSection;

  contentSection.items.forEach((item) => {
    if (item.type === "image" || item.type === "video") {
      item.data.url = cloudinary.utils.signed_url(item.data.publicId, {
        type: "authenticated",
        resource_type: item.type === "video" ? "video" : "image",
        format: item.type === "video" ? "mp4" : "webp",
        expires_at: Math.floor(Date.now() / 1000) + (item.type === "video" ? VIDEO_EXPIRY_TIME : IMAGE_EXPIRY_TIME),
      });
    } else if (item.type === "mcq") {
      // Add signed URL for MCQ question if it has publicId
      if (item.data.question?.publicId) {
        item.data.question.url = cloudinary.utils.signed_url(item.data.question.publicId, {
          type: "authenticated",
          resource_type: "image",
          format: "webp",
          expires_at: Math.floor(Date.now() / 1000) + IMAGE_EXPIRY_TIME,
        });
      }

      // Add signed URLs for MCQ options if they have publicId
      item.data.options.forEach((option) => {
        if (option.publicId) {
          option.url = cloudinary.utils.signed_url(option.publicId, {
            type: "authenticated",
            resource_type: "image",
            format: "webp",
            expires_at: Math.floor(Date.now() / 1000) + IMAGE_EXPIRY_TIME,
          });
        }
      });
    }
  });

  return contentSection;
};

module.exports = addUrls;
