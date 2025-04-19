const Comment = require("../models/Comment");
const User = require("../models/User");
const PageCollection = require("../models/PageCollection");
require("dotenv").config();

const MAX_REPORT=3;

const notifyAllMentions = async (text, comment,url) => {
  // Extract mentions from text (assumes mentions are in "@username" format)
  const mentionRegex = /@(\w+)/g;
  const mentionedUsernames = text.match(mentionRegex)?.map(name => name.slice(1)) || [];
  
  if (mentionedUsernames.length === 0) return; // No mentions, exit
  console.log(url);
  // Update all mentioned users, pushing notification while keeping max 10
  await User.updateMany(
    { username: { $in: mentionedUsernames } },
    {
      $push: {
        notifications: {
          $each: [{ type: "comment", data: comment ,url}],
          $slice: -10 // Keeps only the latest 10 notifications
        }
      }
    }
  );
};

const create = async (req, res) => {
  try {
    const { pageCollectionId, pageId } = req.params;
    const { text, parentComment } = req.body;
    const userId = req.user.id;

    const [pageCollection, parent] = await Promise.all([
      PageCollection.findOne(
        { _id: pageCollectionId, "pages._id": pageId },
        { courseId: 1, moduleId: 1 ,"pages.$": 1}
      ).lean(),
      parentComment ? Comment.findById(parentComment).populate("user", "username photo displayName").lean() : Promise.resolve(null)
    ]);

    if (!pageCollection) {
      return res.status(404).json({ success: false, message: "Page not found" });
    }

    if (parentComment) {
      if (!parent || !parent.pageId.equals(pageId)) {
        return res.status(400).json({ success: false, message: "Invalid parent comment" });
      }

      if (parent.parentComment) {
        return res.status(400).json({
          success: false,
          message: "No reply to a reply — one level of nesting only!"
        });
      }
    }

    const { courseId, moduleId ,pages} = pageCollection;

    const newComment = await Comment.create({
      text,
      user: userId,
      courseId,
      pageId,
      moduleId,
      parentComment: parentComment || null,
    });
    const modifiedText=parent?"@"+parent.user.username+" "+text:""+text;
    const url=`${process.env.CLIENT_URL}/course/${courseId}/module/${pageCollectionId}/page/${pages[0].contentSection}`
    const [_, __, populatedComment] = await Promise.all([
      parent ? Comment.updateOne(
        { _id: parentComment },
        { $inc: { repliesCount: 1 } }
      ) : Promise.resolve(),
      notifyAllMentions(modifiedText, newComment,url),

      Comment.findById(newComment._id).populate("user", "username photo displayName")
    ]);

    return res.status(201).json({ 
      success: true,
      message: "Comment created successfully", 
      comment: populatedComment 
    });

  } catch (error) {
    console.error("Comment creation error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};






const getAll = async (req, res) => {
  try {
    const { pageId } = req.params;
    const { skip = 0, limit = 6, parentComment = null } = req.query;

    const filter = { pageId, parentComment };

    const [comments, totalCount] = await Promise.all([
      Comment.find(filter)
        .sort("-updatedAt")
        .skip(Number(skip))
        .limit(Number(limit))
        .populate("user", "username photo displayName status"),
      
      Comment.countDocuments({ pageId ,parentComment}) // Total comments in the page, regardless of parentComment
    ]);

    const PROVENIX_USER = {
      username: "provenix_user",
      displayName: "Deleted User",
      photo: "", 
    };

    const cleanedComments = comments.map(comment => {
      if (!comment.user || comment.user.status === "deleted") {
        return {
          ...comment.toObject(),
          user: PROVENIX_USER
        };
      }
      return comment;
    });

    res.status(200).json({ 
      success: true, 
      comments: cleanedComments,
      totalCount 
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



const getComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId)
      .populate("user", "username photo displayName");

    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    res.status(200).json({ success: true, comment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const report = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    // Update comment by adding the user to the reportedBy array
    const comment = await Comment.findOneAndUpdate(
      { _id: commentId },
      { $addToSet: { reportedBy: userId } },
      { new: true }
    ).populate("user", "username photo displayName");
    if (!comment) {
      return res.status(404).json({ message: "Comment not found or Unauthorized" });
    }

    // Check if the comment has reached the maximum report limit
    if (comment.reportedBy.length >= MAX_REPORT) {
      // Remove the comment and its replies directly
      await Promise.all([
        Comment.deleteMany({ $or: [{ _id: commentId }, { parentComment: commentId }] }),
        comment.parentComment && Comment.findByIdAndUpdate(comment.parentComment, { $inc: { repliesCount: -1 } })
      ]);
      return res.status(200).json({ message: "Comment has been deleted after exceeding report limit" });
    }

    return res.status(200).json({ message: "Comment reported successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findOne({ _id: commentId, user: userId });
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    await Promise.all([
      Comment.deleteMany({ $or: [{ _id: commentId }, { parentComment: commentId }] }),
      comment.parentComment && Comment.findByIdAndUpdate(comment.parentComment, { $inc: { repliesCount: -1 } })
    ]);

    res.status(200).json({ success: true, message: "Comment and its replies deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


const update = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;
    // Update the comment and check if it exists and if the user matches
    const comment = await Comment.findOneAndUpdate(
      { _id: commentId, user: userId },
      { text },
      { new: true } // This will return the updated comment
    ).populate("user", "username photo displayName");

    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found or Unauthorized" });
    }

    // Notify all mentions after updating the comment
    await notifyAllMentions(text, comment);

    res.status(200).json({ success: true, message: "Comment updated successfully", comment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




module.exports = {
  create,
  remove,
  report,
  getAll,
  getComment,
  update,
};
