const Page = require("../../models/Page");
const Enrollment = require("../../models/Enrollment");

const getPage = async (req, res) => {
    try {
        const { pageId} = req.params;
        const userId = req.user.id;

        const page = await Page.findById(pageId).populate('content');

        if (!page) {
            return res.status(404).json({ message: "No page found" });
        }

        // Check if the user is the creator
        const isCreator = page.creatorId.equals(userId);

        // Check if the user is enrolled
        const isEnrolled = await Enrollment.exists({ user: userId, course: courseId, status: "active" });

        if (!isCreator && !isEnrolled) {
            return res.status(403).json({ message: "Access denied" });
        }

        res.status(200).json(page);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = getPage;
