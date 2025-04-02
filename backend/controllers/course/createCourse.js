const mongoose = require("mongoose");
const Course = require("../../models/Course");
const ModuleCollection = require("../../models/ModuleCollection");

const createCourse = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const creator = req.user.id;

    // Manually assign ObjectIds before inserting
    const courseId = new mongoose.Types.ObjectId();
    const moduleCollectionId = new mongoose.Types.ObjectId();

    // Create both Course and ModuleCollection in parallel
    await Promise.all([
      Course.create({ 
        _id: courseId, // Assign predefined ObjectId 
        title, 
        description, 
        category, 
        creator, 
        moduleCollection: moduleCollectionId // Directly assign reference
      }),
      ModuleCollection.create({ 
        _id: moduleCollectionId, // Assign predefined ObjectId 
        courseId, // Directly assign reference 
        creatorId: creator, 
        modules: [] 
      })
    ]);

    const course = await Course.findById(courseId)
      .populate("creator", "username photo displayName")
      .lean(); // Convert to plain JS object

    res.status(201).json({success: true,
      message: "Course and ModuleCollection created!",
      course: { ...course, isCreator:true, isEnrolled:false }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = createCourse;
