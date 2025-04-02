const Enrollment = require("../../models/Enrollment");
const Course = require("../../models/Course");

const removeDeletedCourses = async () => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    // Find courses that are marked as deleted and have been updated more than an hour ago
    const deletedCourses = await Course.aggregate([
      {
        $match: {
          status: "deleted",
          updatedAt: { $lte: oneHourAgo },
        },
      },
      {
        $lookup: {
          from: "enrollments", // Collection name for Enrollment
          localField: "_id",
          foreignField: "course",
          as: "enrollments",
        },
      },
      {
        $match: {
          "enrollments.status": { $ne: "active" },
        },
      },
      {
        $project: {
          _id: 1,
        },
      },
    ]);



      //complete this you lazy developer


     // **Delete all related data in parallel, including the course itself**
        // await Promise.all([
        //     Page.deleteMany({ courseId: req.params.courseId }),       // Delete all pages of the course
        //     Comment.deleteMany({ courseId: req.params.courseId }),    // Delete all comments
        //     Review.deleteMany({ courseId: req.params.courseId }),     // Delete all reviews
        //     ContentSection.updateMany({ courseId: req.params.courseId }, { status: "deleted" }), // Soft delete ContentSection
        //     Course.deleteOne({ _id: req.params.courseId }) // Finally, delete the course itself
        //     delete ModuleCollections as well 
        // ]);


    if (deletedCourses.length > 0) {
      const courseIds = deletedCourses.map((course) => course._id);
      await Course.deleteMany({ _id: { $in: courseIds } });
      console.log(`Deleted courses: ${courseIds}`);
    }
  } catch (error) {
    console.error("Error removing deleted courses:", error);
  }
};

module.exports = removeDeletedCourses;
