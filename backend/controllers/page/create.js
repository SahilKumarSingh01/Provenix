const Page = require("../../models/Page");
const ContentSection = require("../../models/ContentSection");
const Course = require("../../models/Course");

const create = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, section } = req.body;
    const creatorId = req.user.id;

    // Check if the course exists and if the user is the creator
    const course = await Course.findOne({ _id: courseId, creator: creatorId });
    if (!course) return res.status(403).json({ message: "Unauthorized" });

    // Validate that the provided section exists in the course's sections array
    if (!course.sections.includes(section)) {
      return res.status(400).json({ message: "Invalid section" });
    }

    // Use course's pageCount as the order
    const page = await Page.create({
      title,
      courseId,
      creatorId,
      section,
      order: course.pageCount, // Using course.pageCount for order
    });

    // Create the content section with correct sourceType (the section from body)
    const contentSection = await ContentSection.create({
      pageId: page._id, // Linking content to the page
      section, // Using the provided section as sourceType
      courseId,
      creatorId,
      items: [],
    });

    // Perform updates concurrently using Promise.all
    await Promise.all([
      Page.updateOne({ _id: page._id }, { content: contentSection._id }),
      Course.updateOne({ _id: courseId }, { $inc: { pageCount: 1 } })
    ]);

    res.status(201).json({ message: "Page created successfully", page });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = create;
