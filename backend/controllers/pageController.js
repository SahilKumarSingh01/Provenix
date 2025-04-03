const mongoose = require("mongoose");
const PageCollection = require("../models/PageCollection");
const ContentSection = require("../models/ContentSection");
const Course = require('../models/Course');
const Comment = require("../models/Comment");

const create = async (req, res) => {
  try {
    const { title} = req.body;
    const { pageCollectionId } = req.params;
    const creatorId = req.user.id;

    const pageId = new mongoose.Types.ObjectId();
    const contentSectionId = new mongoose.Types.ObjectId();

    const updatedPageCollection = await PageCollection.findOneAndUpdate(
      { _id: pageCollectionId, creatorId }, 
      {$push: {pages: { _id: pageId, title, contentSection: contentSectionId }}},
      { new: true }
    ).lean();

    if (!updatedPageCollection) 
      return res.status(404).json({success: false,message: "PageCollection not found or unauthorized"});

    const moduleId=updatedPageCollection.moduleId;
    const courseId= updatedPageCollection.courseId;
    const [contentSection,course]=await Promise.all([
      ContentSection.create({_id: contentSectionId,pageId,moduleId,courseId,creatorId,items: []}),
      Course.findOneAndUpdate({ _id:courseId },{ $inc: { pageCount: 1 } },{new:true}).select({pageCount:1}),
    ]);
    res.status(201).json({success: true,
        message: "Page created with ContentSection!",
        pages: updatedPageCollection.pages,
        pageCount:course.pageCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCollection = async (req, res) => {
    try {
        const { pageCollectionId } = req.params;
        const pageCollection =await PageCollection.findById(pageCollectionId)
        if (!pageCollection) {
            return res.status(404).json({ message: "PageCollection not found" });
        }
        res.status(200).json({message: "Pages fetched successfully",pageCollection});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const remove = async (req, res) => {
  try {
    const { pageCollectionId } = req.params;
    const { courseId, pageId } = req.query;
    const userId = req.user.id;

    // Fetch course and pageCollection concurrently, including page existence check in PageCollection query
    const [isCourse, pageCollection] = await Promise.all([
      Course.exists({ _id: courseId, creator: userId, status: "draft" }),
      PageCollection.findOne({ _id: pageCollectionId,courseId,creatorId: userId,"pages._id": pageId}),
    ]);

    if (!isCourse) {
      return res.status(404).json({ message: "Course not found, unauthorized, or not in draft state" });
    }
    if (!pageCollection) {
      return res.status(404).json({ message: "Page not found in the collection or unauthorized" });
    }

    // Use Promise.all to run the operations concurrently, including course update
    const [updatedPageCollection, contentSectionUpdate, commentDeletion, updatedCourse] = await Promise.all([
      PageCollection.findOneAndUpdate(
        { _id: pageCollectionId },
        { $pull: { pages: { _id: pageId } } },
        { new: true }
      ),
      ContentSection.updateMany(
        { courseId,pageId,status:"active" },
        { $set: { status: "deleted" } }
      ),
      Comment.deleteMany({ courseId, pageId }),
      Course.findOneAndUpdate({ _id: courseId }, { $inc: { pageCount: -1 } },{new:true}).select({pageCount:1}),
    ]);

    // Prepare the response message
    const pagesDeleted = 1;
    const commentsDeleted = commentDeletion.deletedCount;
    const contentSectionsDeleted = contentSectionUpdate.modifiedCount;

    res.json({
      message: `Removed ${pagesDeleted} page, ${commentsDeleted} comments, and ${contentSectionsDeleted} content sections. Page removed from collection.`,
      pages: updatedPageCollection.pages || [], // Use the updatedPageCollection directly
      pageCount:updatedCourse.pageCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const reorder = async (req, res) => {
    try {
        const { pageCollectionId } = req.params;
        let { oldIndex, newIndex } = req.body;
        const userId = req.user.id;

        const updatedPageCollection = await PageCollection.findOneAndUpdate(
            { 
                _id: pageCollectionId, 
                creatorId: userId,
                [`pages.${oldIndex}`]: { $exists: true },
                [`pages.${newIndex}`]: { $exists: true }
            },
            [
                {
                    $set: {
                        pages: {
                            $let: {
                                vars: {
                                    pageToMove: { $arrayElemAt: ["$pages", oldIndex] },
                                    filteredPages: {
                                        $filter: {
                                            input: "$pages",
                                            as: "page",
                                            cond: { $ne: ["$$page", { $arrayElemAt: ["$pages", oldIndex] }] }
                                        }
                                    }
                                },
                                in: {
                                    $concatArrays: [
                                        {
                                            $cond: {
                                                if: { $eq: [newIndex, 0] },
                                                then: [],
                                                else: { $slice: ["$$filteredPages", 0, newIndex] }
                                            }
                                        },
                                        ["$$pageToMove"],
                                        {
                                            $cond: {
                                                if: { $eq: [newIndex, { $size: "$$filteredPages" }] },
                                                then: [],
                                                else: { 
                                                    $slice: ["$$filteredPages", newIndex, { 
                                                        $subtract: [{ $size: "$$filteredPages" }, newIndex] 
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
  
        if (!updatedPageCollection) {
            return res.status(403).json({ message: "Failed to reorder page" });
        }
  
        res.status(200).json({message: "Page reordered successfully",pages: updatedPageCollection.pages});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const update = async (req, res) => {
  try {
    const { pageCollectionId } = req.params;
    const {pageId} = req.query;
    const { title } = req.body;
    const userId = req.user.id;
    // Directly find and update the page title in the PageCollection
    const updatedPageCollection = await PageCollection.findOneAndUpdate(
      { _id: pageCollectionId, "pages._id": pageId, creatorId: userId },
      { $set: { "pages.$.title": title } }, // Update only the page title
      { new: true } // Return the updated PageCollection
    );

    if (!updatedPageCollection) {
      return res.status(404).json({ message: "Page not found or unauthorized" });
    }
    res.json({message: "Page title updated successfully",pages: updatedPageCollection.pages});

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { create, getCollection, remove, update, reorder };
