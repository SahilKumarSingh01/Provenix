const mongoose = require("mongoose");
const ModuleCollection = require("../models/ModuleCollection");
const PageCollection = require("../models/PageCollection");
const Comment = require("../models/Comment");
const ContentSection = require("../models/ContentSection");
const Course = require("../models/Course");
const removeContentSection=require('../utils/removeContentSection');


const createModule = async (req, res) => {
  try {
    const { title } = req.body;
    const { moduleCollectionId } = req.params;
    const creatorId = req.user.id;

    // Pre-generate ObjectIds for efficiency
    const moduleId = new mongoose.Types.ObjectId();
    const pageCollectionId = new mongoose.Types.ObjectId();

    // Add the module with pre-assigned ObjectId and pageCollectionId
    const updatedModuleCollection = await ModuleCollection.findOneAndUpdate(
      { _id: moduleCollectionId, creatorId }, // Ensures only the creator can update
      { $push: { modules: { _id: moduleId, title, pageCollection: pageCollectionId } } }, // Assign IDs beforehand
      { new: true }
    );

    if (!updatedModuleCollection)
      return res.status(404).json({ success: false, message: "ModuleCollection not found or unauthorized" });

    // Create a PageCollection using the pre-assigned ObjectId
    await PageCollection.create({
      _id: pageCollectionId,
      courseId: updatedModuleCollection.courseId,
      creatorId,
      moduleId,
      pages: [],
    });

    res.status(201).json({
      success: true,
      message: "Module created with PageCollection!",
      modules: updatedModuleCollection.modules
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const getCollection = async (req, res) => {
  try {
    const { moduleCollectionId } = req.params;

    // Find the module collection by its ID
    const moduleCollection = await ModuleCollection.findOne(
      { _id: moduleCollectionId },
    );

    if (!moduleCollection) {
      return res.status(404).json({ message: "ModuleCollection not found" });
    }

    // Return the whole module collection with modules
    res.status(200).json({
      message: "ModuleCollection fetched successfully",
      moduleCollection: moduleCollection
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const removeModule = async (req, res) => {
  try {
    const { courseId, moduleId } = req.query;
    const userId = req.user.id;

    // Find course and ensure it's in draft state
    const course = await Course.findOne({ _id: courseId, creator: userId, status: "draft" })
      .populate({
        path: "moduleCollection",
        select: "_id modules",
      })
      .select("_id moduleCollection");

    if (!course || !course.moduleCollection) {
      return res.status(404).json({ message: "Course not found, unauthorized, or not in draft state" });
    }
    // Check if the module exists
    const moduleExists = course.moduleCollection.modules.some(mod => mod._id.equals(moduleId));
    if (!moduleExists) {
      return res.status(404).json({ message: "Module not found in this course" });
    }

    const moduleCollectionId = course.moduleCollection._id;

    const [pageDeletionResult, commentsResult, result, updatedModuleCollection] = await Promise.all([
        PageCollection.findOneAndDelete({ courseId, moduleId }).select("pages"),
        Comment.deleteMany({ courseId, moduleId }),
        removeContentSection(courseId,moduleId, null, true),
        ModuleCollection.findOneAndUpdate(
          { _id: moduleCollectionId },
          { $pull: { modules: { _id: moduleId } } },
          { new: true }
        )
      ]);
    const pagesDeleted = pageDeletionResult?.pages.length || 0;
    res.json({
      message: `Removed ${pagesDeleted} pages, ${commentsResult.deletedCount} comments. Module removed from collection.`,
      modules: updatedModuleCollection.modules,
      pageCount:result.course.pageCount,
      codeCount:result.course.codeCount,
      videoCount:result.course.videoCount,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateModule = async (req, res) => {
    try {
        const { moduleId, title } = req.body;
        const { moduleCollectionId } = req.params;

        const updatedModuleCollection = await ModuleCollection.findOneAndUpdate(
            { _id: moduleCollectionId, creatorId: req.user.id, "modules._id": moduleId, "modules.title": { $ne: title } }, 
            { $set: { "modules.$.title": title } }, 
            { new: true }
        );

        if (!updatedModuleCollection)
            return res.status(404).json({ success: false, message: "Module not found or title already exists" });

        res.status(200).json({ success: true, message: "Module title updated!", modules: updatedModuleCollection.modules });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const reorderModule = async (req, res) => {
    try {
        const { moduleCollectionId } = req.params;
        let { oldIndex, newIndex } = req.body;
        const userId = req.user.id;

        const updatedModuleCollection = await ModuleCollection.findOneAndUpdate(
            { 
                _id: moduleCollectionId, 
                creatorId: userId,
                [`modules.${oldIndex}`]: { $exists: true },
                [`modules.${newIndex}`]: { $exists: true }
            },
            [
                {
                    $set: {
                        modules: {
                            $let: {
                                vars: {
                                    moduleToMove: { $arrayElemAt: ["$modules", oldIndex] },
                                    filteredModules: {
                                        $filter: {
                                            input: "$modules",
                                            as: "mod",
                                            cond: { $ne: ["$$mod", { $arrayElemAt: ["$modules", oldIndex] }] }
                                        }
                                    }
                                },
                                in: {
                                    $concatArrays: [
                                        {
                                            $cond: {
                                                if: { $eq: [newIndex, 0] },
                                                then: [],
                                                else: { $slice: ["$$filteredModules", 0, newIndex] }
                                            }
                                        },
                                        ["$$moduleToMove"],
                                        {
                                            $cond: {
                                                if: { $eq: [newIndex, { $size: "$$filteredModules" }] },
                                                then: [],
                                                else: { 
                                                    $slice: ["$$filteredModules", newIndex, { 
                                                        $subtract: [{ $size: "$$filteredModules" }, newIndex] 
                                                    }]
                                                }
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    }
                }
            ],
            { new: true } // Returns updated document
          );
  
          if (!updatedModuleCollection) {
              return res.status(403).json({ message: "Failed to reorder module" });
          }
  
          res.status(200).json({
              message: "Module reordered successfully",
              modules: updatedModuleCollection.modules
          });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createModule,
    removeModule,
    updateModule,
    reorderModule,
    getCollection

}
