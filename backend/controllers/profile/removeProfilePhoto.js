const User = require("../../models/User");
const cloudinary = require("cloudinary").v2;

const extractPublicId = (imageUrl) => {
    try {
        const urlParts = imageUrl.split("/");
        const publicIdWithExtension = urlParts[urlParts.length - 1]; // Get last part
        return publicIdWithExtension.split(".")[0]; // Remove extension
    } catch (error) {
        console.error("Error extracting publicId:", error);
        return null;
    }
};

const removeProfilePhoto = async (req, res) => {
    try {
        const userId = req.user.id;

        // Remove photo and retrieve old document in one step
        const oldUser = await User.findOneAndUpdate(
            { _id: userId },
            { $unset: { photo: 1 } }, // Properly unset the photo field
            { new: false } // Get the document *before* update
        ).select("photo"); // Fetch only the `photo` field

        if (!oldUser || !oldUser.photo) {
            return res.status(400).json({ error: "No profile photo to remove" });
        }

        // Extract publicId from old photo and delete from Cloudinary
        const oldPublicId = extractPublicId(oldUser.photo);
        if (oldPublicId) {
            await cloudinary.uploader.destroy(oldPublicId);
        }

        res.json({ success: true, message: "Profile photo removed successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = removeProfilePhoto;
