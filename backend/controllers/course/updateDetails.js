const Course = require("../../models/Course"); 
const User = require('../../models/User');
const OrphanResource = require("../../models/OrphanResource");
const extractPublicId = require('../../utils/extractPublicId');

const updateDetails = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { title, description, thumbnail, price, category, tags, level } = req.body;
        const publicId = thumbnail ? extractPublicId(thumbnail) : "";

        const [course, user, isOrphanResource] = await Promise.all([
            Course.findOne({ _id: courseId, creator: req.user.id }).select("thumbnail"),
            User.findById(req.user.id).select("activatedAccount"),
            publicId ? OrphanResource.exists({ publicId, type: "image", category: "thumbnail" }) : null,
        ]);

        if (!course) {
            return res.status(403).json({ message: "You are not authorized to edit this course." });
        }

        if (thumbnail && course.thumbnail !== thumbnail && !isOrphanResource) {
            return res.status(400).json({ message: "Invalid thumbnail reference." });
        }
        if(price>0&&!user.activatedAccount)
        {
            return res.status(400).json({message:"You don't have any activated account associated with us"});
        }
        // Prepare update object with only the provided fields
        const updateFields = {};
        if (title) updateFields.title = title;
        if (description) updateFields.description = description;
        updateFields.price = price;
        if (category) updateFields.category = category;
        if (tags) updateFields.tags = tags;
        if (level) updateFields.level = level;

        // Handle thumbnail updates
        const prevThumbnail = course.thumbnail;
        if (thumbnail !== prevThumbnail) {
            updateFields.thumbnail = thumbnail || "";
        }

        // Update the course
        const updatedCourse =await Course.findOneAndUpdate({ _id: courseId }, { $set: updateFields },{new:true})
                                         .populate("creator", "username photo displayName")
                                         .lean();

        // Handle  orphan resource cleanup
        if (thumbnail !== prevThumbnail) {
            await Promise.all([
                prevThumbnail ? OrphanResource.create({ publicId: extractPublicId(prevThumbnail), type: "image", category: "thumbnail" }) : null,
                thumbnail ? OrphanResource.deleteOne({ publicId, type: "image", category: "thumbnail" }) : null,
            ]);
        }

        return res.status(200).json({ message: "Course updated successfully.",
            course: { ...updatedCourse, isCreator:true, isEnrolled:false }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = updateDetails;
