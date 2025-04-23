const Course = require("../../models/Course");
const MAX_REPORT = 3;

const reportCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Step 1: Add user to reportedBy set (no duplicates)
    const course = await Course.findOneAndUpdate(
      { _id: courseId },
      { $addToSet: { reportedBy: userId } },
      { new: true }
    ).populate("creator", "username photo displayName");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Step 2: If reports exceed the max, soft delete course via updateOne
    if (course.reportedBy.length >= MAX_REPORT) {
      await Course.updateOne(
        { _id: courseId },
        { status: "deleted" }
      );

      return res.status(200).json({
        message: "Course has been reported multiple times and is now deleted",
        course: { ...course.toObject(), status: "deleted", isDeleted: true }
      });
    }

    return res.status(200).json({ message: "Course reported successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = reportCourse;
