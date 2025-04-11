const Enrollment = require("../../models/Enrollment");

const getProgress = async (req, res) => {
    try {
        const userId = req.user.id;
        const {courseId}=req.query;

        const enrollment = await Enrollment.findOne({course:courseId ,user: userId }).select('completedPages');

        if (!enrollment) {
            return res.status(404).json({ success: false, message: "Progess not found" });
        }

        res.status(200).json({ success: true, message: "Progress fetched successfully" ,completedPages: enrollment.completedPages});

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = getProgress;
