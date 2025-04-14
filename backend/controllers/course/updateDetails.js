const User = require("../../models/User");
const OrphanResource = require("../../models/OrphanResource");
const extractPublicId = require("../../utils/extractPublicId");

const updateProfile = async (req, res) => {
    try {
        const { userId } = req.params; // Admin or staff updating profile
        const { username, photo, displayName, email, bio } = req.body;

        const publicId = photo ? extractPublicId(photo) : "";

        const isOrphanPhoto = publicId
            ? await OrphanResource.exists({ publicId, type: "image", category: "profile" })
            : null;

        const updates = {};
        if (username) updates.username = username;
        if (displayName) updates.displayName = displayName;
        if (email) {
            updates.email = email;
            updates.verifiedEmail = false;
        }
        if (bio) updates.bio = bio;
        if (photo !== undefined) updates.photo = photo;

        const prevUser = await User.findByIdAndUpdate(userId, { $set: updates }, { new: false }).select("username displayName email bio photo").lean();

        if (!prevUser)
            return res.status(404).json({ message: "User not found." });

        if (photo && prevUser.photo !== photo && !isOrphanPhoto)
            return res.status(400).json({ message: "Invalid photo reference." });

        // Manual merge like a pro 😎
        const updatedUser = {
            ...prevUser,
            ...updates
        };

        if (photo !== prevUser.photo) {
            await Promise.all([
                prevUser.photo && OrphanResource.create({
                    publicId: extractPublicId(prevUser.photo),
                    type: "image",
                    category: "profile"
                }),
                photo && OrphanResource.deleteOne({
                    publicId,
                    type: "image",
                    category: "profile"
                })
            ]);
        }

        res.status(200).json({
            message: "Profile updated successfully.",
            user: updatedUser
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

module.exports = updateProfile;
