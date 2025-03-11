const Page = require("../../models/Page");
const Enrollment = require("../../models/Enrollment");

const getAll = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { section } = req.body; // Now taking section from body
        const userId = req.user.id;

        // Fetch pages in this section, sorted by order
        const pages = await Page.find({ courseId, section }).sort("order");

        if (pages.length === 0) {
            return res.status(404).json({ message: "No pages found" });
        }

        // Check if the user is the creator
        const isCreator = pages[0].creatorId.equals(userId);

        // Check if the user is enrolled
        const isEnrolled = await Enrollment.exists({ user: userId, course: courseId, status: "active" });

        if (!isCreator && !isEnrolled) {
            return res.status(403).json({ message: "Access denied" });
        }

        res.status(200).json(pages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = getAll;
