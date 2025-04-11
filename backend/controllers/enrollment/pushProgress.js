const Enrollment = require("../../models/Enrollment");

const pushProgress = async (req, res) => {
    try {
        const userId = req.user.id;
        const {courseId}=req.query
        const { pageId } = req.body;

        if (!pageId) {
            return res.status(400).json({ success: false, message: "Page ID is required" });
        }

        const result = await Enrollment.updateMany(
            { course:courseId, user: userId },
            { $addToSet: { completedPages: pageId } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: "Enrollment not found" });
        }

        res.status(200).json({ success: true, message: "Progress updated successfully" });

    } catch (error) {
        res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
    }
};

module.exports = pushProgress;
