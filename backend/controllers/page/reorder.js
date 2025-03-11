const Page = require("../../models/Page");

const reorder = async (req, res) => {
  try {
    const { page1Id, page2Id } = req.body;
    const userId = req.user.id;

    // Fetch the pages
    const pages = await Page.find({ _id: { $in: [page1Id, page2Id] } });

    if (pages.length !== 2) {
      return res.status(400).json({ error: "Invalid page IDs" });
    }

    const [page1, page2] = pages;

    // Ensure the user is the creator of both pages before any other validation
    if (!page1.creatorId.equals(userId) || !page2.creatorId.equals(userId)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Ensure both pages belong to the same course and section
    if (!page1.courseId.equals(page2.courseId) || page1.section !== page2.section) {
      return res.status(400).json({ error: "Pages do not belong to the same course or section" });
    }

    // Swap order values
    await Promise.all([
      Page.updateOne({ _id: page1._id }, { order: page2.order }),
      Page.updateOne({ _id: page2._id }, { order: page1.order })
    ]);

    res.json({ message: "Pages reordered successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = reorder;
