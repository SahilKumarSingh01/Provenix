const User = require("../../models/User");
const OrphanResource = require("../../models/OrphanResource");
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

const updateMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { username, photo, displayName, email } = req.body;

        let updateFields = {};

        if (username) updateFields.username = username;
        if (displayName) updateFields.displayName = displayName;
        if (email) {
            updateFields.email = email;
            updateFields.verifiedEmail = false;
        }

        if (photo) {
            // Delete from orphan resources and check if it was present
            const orphanDeletion = await OrphanResource.findOneAndDelete({ publicId: photo, type: "image", category: "profile" });

            if (!orphanDeletion) {
                return res.status(400).json({ error: "Invalid photo reference" });
            }

            // Generate signed URL for the new authenticated photo
            updateFields.photo = cloudinary.utils.private_download_url(photo, "webp");
        }

        // Update the user and fetch the old document in one call
        const oldUser = await User.findOneAndUpdate({ _id: userId }, updateFields, { new: false })
            .select("photo");

        // Extract publicId from old photo and delete from Cloudinary
        if (oldUser?.photo) {
            const oldPublicId = extractPublicId(oldUser.photo);
            if (oldPublicId) {
                await cloudinary.uploader.destroy(oldPublicId);
            }
        }

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = updateMyProfile;
