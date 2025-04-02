const Enrollment = require("../../models/Enrollment");

const getProgress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { courseId } = req.body;

        if (!pageId) {
            return res.status(400).json({ success: false, message: "Page ID is required" });
        }

        const enrollment = await Enrollment.findOne({ course:courseId, user: userId }).select('completedPages');

        if (!enrollment) {
            return res.status(404).json({ success: false, message: "Progess not found" });
        }

        res.status(200).json({ success: true, message: "Progress fetched successfully" ,progress: enrollment.completedPages});

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = getProgress;
