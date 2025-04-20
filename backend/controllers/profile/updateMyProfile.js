const User = require("../../models/User");
const OrphanResource = require("../../models/OrphanResource");
const extractPublicId = require("../../utils/extractPublicId");

const updateProfile = async (req, res) => {
    try {
        const { username, photo, displayName, email, bio } = req.body;
        const userId=req.user.id;

        const limits = {
            username: 30,
            displayName: 30,
            bio: 500,
          };
          
          for (const key of Object.keys(limits)) {
            if (req.body[key] && req.body[key].length > limits[key]) {
              return res.status(400).json({ message: `${key} must be at most ${limits[key]} characters.` });
            }
          }
          
        const publicId = photo ? extractPublicId(photo) : "";

        const [isOrphanPhoto, currentUser] = await Promise.all([
            publicId
              ? OrphanResource.exists({ publicId, type: "image", category: "profile" })
              : Promise.resolve(null),
            User.findById(userId)
          ]);
          
        const updates = {};
        if (username && username !== currentUser.username) {
            const usernameRegex = /^[^\s]+$/;
            if (!usernameRegex.test(username)) {
              return res.status(400).json({ message: "Username must not contain spaces and cannot be empty." });
            }
            updates.username = username;
        }
        if (email && email !== currentUser.email) {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email)) {
              return res.status(400).json({ message: "Please provide a valid email." });
            }
            updates.email = email;
            updates.verifiedEmail = false;
        }
        if (displayName) updates.displayName = displayName;
        if (bio) updates.bio = bio;
        if (photo !== undefined) updates.photo = photo;

        const prevUser = await User
            .findByIdAndUpdate(userId, { $set: updates }, { new: false })
            .select("username displayName email bio photo")
            .lean();
            
        if (!prevUser)
            return res.status(404).json({ message: "User not found." });

        if (photo && prevUser.photo !== photo && !isOrphanPhoto)
            return res.status(400).json({ message: "Invalid photo reference." });

        const updatedUser = {
            ...prevUser,
            ...updates
        };

        if (photo !== prevUser.photo) {
            await Promise.all([
                prevUser.photo && OrphanResource.create({publicId: extractPublicId(prevUser.photo),type: "image",category: "profile"}),
                photo && OrphanResource.deleteOne({publicId,type: "image",category: "profile"})
            ]);
        }

        res.status(200).json({
            message: "Profile updated successfully.",
            user: updatedUser,
        });

    } catch (error) {
        if (error.code === 11000) { // MongoDB error code for duplicate key
            if (error.message.includes('username')) {
                return res.status(400).json({ message: "Username is already taken." });
            }
            if (error.message.includes('email')) {
                return res.status(400).json({ message: "Email is already in use." });
            }
        }
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

module.exports = updateProfile;
