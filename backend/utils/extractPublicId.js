const extractPublicId = (cloudinaryUrl) => {
    try {
      if (!cloudinaryUrl || typeof cloudinaryUrl !== "string") {
        throw new Error("Invalid URL");
      }
  
      const parts = cloudinaryUrl.split("/");
      if (parts.length < 2) {
        throw new Error("Invalid Cloudinary URL format");
      }
  
      return parts[parts.length - 2] + "/" + parts[parts.length - 1].split(".")[0];
    } catch (error) {
      console.error("Error extracting public ID:", error.message);
      return null;
    }
  };
  
  module.exports = extractPublicId;
  