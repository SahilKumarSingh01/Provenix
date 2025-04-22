const Enrollment = require("../../models/Enrollment");
const Course = require("../../models/Course");
const ModuleCollection = require("../../models/ModuleCollection");
const PageCollection = require("../../models/PageCollection");
const Review = require("../../models/Review");
const Comment = require("../../models/Comment");
const InsightSection = require("../../models/InsightSection"); // Updated model reference
const OrphanResource = require("../../models/OrphanResource");
const ContentSection = require("../../models/ContentSection");
const extractPublicId = require('../../utils/extractPublicId');

const removeContentSection = async (courseIds) => {
  try {
    // Prepare query to fetch content sections related to the courseIds array
    const query = { courseId: { $in: courseIds } };

    // Fetch content sections related to the courseIds array in a single query
    const sections = await ContentSection.find(query);

    let orphanEntries = [];
    let videoCount = 0;
    let codeCount = 0;
    const uniquePageIds = new Set();

    // Iterate over each section to collect orphan resources
    for (let section of sections) {
      uniquePageIds.add(section.pageId.toString());  // Ensure uniqueness of pageIds

      for (let item of section.items) {
        const { type, _id: itemId, data } = item;

        // Handle orphan resources based on item type
        if (type === "image") {
          // Orphan image resources
          data.publicId && orphanEntries.push({ publicId: data.publicId, type: "image", category: "pagePhoto" });
        }

        if (type === "mcq") {
          // Handle orphan images in MCQs (questions and options)
          const publicIds = [];
          if (data?.ques?.publicId) publicIds.push(data.ques.publicId);
          if (data?.options) {
            data.options.forEach(opt => opt?.publicId && publicIds.push(opt.publicId));
          }
          // Collect orphan resources for MCQs
          publicIds.forEach(publicId => orphanEntries.push({ publicId, type: "image", category: "pagePhoto" }));
        }

        if (type === "code") {
          // Handle orphan resources related to code items
          const deletedItem = data;
          const decrementValue = deletedItem?.length || 0;
          codeCount += decrementValue;
        }

        if (type === "video") {
          // Handle orphan video resources
          const { publicId } = data;
          publicId && orphanEntries.push({ publicId, type: "video", category: "pageVideo" });
          publicId && videoCount++;
        }
      }
    }

    // Deleting content sections and orphan resources in parallel
    await Promise.all([
      orphanEntries.length ? OrphanResource.insertMany(orphanEntries, { ordered: false }) : Promise.resolve(),
      ContentSection.deleteMany(query),
    ]);

    return { success: true, videoCount, codeCount, uniquePageIds };

  } catch (error) {
    console.error("Error in removeContentSection:", error);
    return { success: false, message: error.message };
  }
};

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
          thumbnail:1,
        },
      },
    ]);

    if (deletedCourses.length > 0) {
      const courseIds = deletedCourses.map((course) => course._id);
      const orphanEntries = [];
      deletedCourses.forEach((course) => {
        if (course?.thumbnail) {
          orphanEntries.push({ publicId: extractPublicId(course.thumbnail), type: "image", category: "thumbnail" });
        }
      });
      
      if (orphanEntries.length > 0) {
        await OrphanResource.insertMany(orphanEntries, { ordered: false });
      }
    
      // Step 1: Remove content sections and orphan resources for all courses in one go
      await removeContentSection(courseIds);

      // Step 2: Remove all related resources for each course in parallel
      await Promise.all([
        ModuleCollection.deleteMany({ courseId: { $in: courseIds } }), // Delete related module collections
        PageCollection.deleteMany({ courseId: { $in: courseIds } }), // Delete related page collections
        Review.deleteMany({ courseId: { $in: courseIds } }), // Delete related reviews
        Comment.deleteMany({ courseId: { $in: courseIds } }), // Delete related comments
        InsightSection.deleteMany({ courseId: { $in: courseIds } }), // Delete related insight sections
        Enrollment.deleteMany({ course: { $in: courseIds } }), // Delete related enrollments
      ]);

      // Step 3: Delete the courses themselves after everything else is cleaned up
      await Course.deleteMany({ _id: { $in: courseIds } });

      console.log(`Deleted courses: ${courseIds}`);
    }
  } catch (error) {
    console.error("Error removing deleted courses:", error);
  }
};

module.exports = removeDeletedCourses;
