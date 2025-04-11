const Comment = require("../models/Comment");
const PageCollection = require("../models/PageCollection");

const MAX_REPORT=3;

const notifyAllMentions = async (text, comment) => {
  // Extract mentions from text (assumes mentions are in "@username" format)
  const mentionRegex = /@(\w+)/g;
  
  const mentionedUsernames = text.match(mentionRegex)?.map(name => name.slice(1)) || [];
  
  if (mentionedUsernames.length === 0) return; // No mentions, exit

  // Update all mentioned users, pushing notification while keeping max 10
  await User.updateMany(
    { username: { $in: mentionedUsernames } },
    {
      $push: {
        notifications: {
          $each: [{ type: "comment", data: comment }],
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
        { courseId: 1, moduleId: 1 }
      ).lean(),
      parentComment ? Comment.findById(parentComment).lean() : Promise.resolve(null)
    ]);

    if (!pageCollection) {
      return res.status(404).json({ success: false, message: "Page not found" });
    }

    if (parentComment && (!parent || !parent.pageId.equals(pageId))) {
      return res.status(400).json({ success: false, message: "Invalid parent comment" });
    }

    const { courseId, moduleId } = pageCollection;

    const newComment = await Comment.create({
      text,
      user: userId,
      courseId,
      pageId,
      moduleId,
      parentComment: parentComment || null,
    }).populate("user", "username photo displayName");

    const updateTasks = [
      PageCollection.updateOne(
        { _id: pageCollectionId },
        { $inc: { "pages.$[elem].commentCount": 1 } },
        { arrayFilters: [{ "elem._id": pageId }] }
      )
    ];

    if (parent) {
      updateTasks.push(
        Comment.updateOne(
          { _id: parentComment },
          { $inc: { repliesCount: 1 } }
        )
      );
    }

    Promise.all(updateTasks).catch(console.error);

    notifyAllMentions(text, newComment).catch(err => {
      console.error("notifyAllMentions error:", err);
    });

    return res.status(201).json({ success: true,message:"Comment created successfully", comment: newComment });

  } catch (error) {
    console.error("Comment creation error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};




const getAll = async (req, res) => {
  try {
    const { pageId } = req.params; // Using both pageId and courseId from params
    const { skip = 0, limit = 6, parentComment = null } = req.query;

    const filter = { pageId, parentComment }; // Using courseId directly from params
    const comments = await Comment.find(filter)
      .sort("-updatedAt")
      .skip(Number(skip))
      .limit(Number(limit))
      .populate("user", "username photo displayName"); // Populating user instead of userId

    res.status(200).json({ success: true, comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const getComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId)
      .populate("userId", "username photo displayName");

    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    res.status(200).json({ success: true, comment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const report=async(req,res)=>{
  try {
    const { commentId } = req.params;
    const user = req.user.id;

    // Update review directly using reviewId and user both together
    const comment = await Comment.findOneAndUpdate(
      { _id: commentId },
      { $addToSet:{reportedBy:user} },
      { new: true } // This will return the updated review
    )
    if (!comment) {
      return res.status(404).json({ message: "Review not found or Unauthorized" });
    }
    if(Comment.reportedBy.length>=MAX_REPORT)
    {
        await remove(req,res);
        return res.status(200).json({ message: "Review has been deleted after exceeding report limit" });

    }

    return res.status(200).json({ message: "Review reported successfully", review });


  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const remove = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    const commentsToDelete = await Comment.aggregate([
      { $match: { _id: comment._id } },
      {
        $graphLookup: {
          from: "comments",
          startWith: "$_id",
          connectFromField: "_id",
          connectToField: "parentComment",
          as: "replies"
        }
      }
    ]);

    const allCommentIds = [commentId, ...commentsToDelete[0]?.replies.map(c => c._id)];

    await Comment.deleteMany({ _id: { $in: allCommentIds } });

    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, { $inc: { repliesCount: -1 } });
    }

    await Page.findByIdAndUpdate(comment.pageId, { $inc: { commentCount: -allCommentIds.length } });

    res.status(200).json({ success: true, message: "Comment and all replies deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



const update = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    if (comment.user.equals(userId)) {
      return res.status(403).json({ success: false, message: "Unauthorized to update this comment" });
    }

    comment.text = text;
    await comment.save();
    notifyAllMentions(text, newComment)
    .catch(error => console.error("Error in notifyAllMentions:", error));
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
