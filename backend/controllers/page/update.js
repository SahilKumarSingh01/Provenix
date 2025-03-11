const Page = require("../../models/Page");

const update = async (req, res) => {
  try {
    const { pageId } = req.params;
    const { title } = req.body;
    const userId = req.user.id;

    // Fetch the page
    const page = await Page.findById(pageId);
    if (!page) return res.status(404).json({ message: "Page not found" });

    // Ensure the user is the creator
    if (!page.creatorId.equals(userId)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update only the title
    await Page.updateOne({ _id: pageId }, { title });

    res.json({ message: "Page title updated successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = update;
