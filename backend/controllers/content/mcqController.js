const Comment = require("../../models/Comment");
const Page = require("../../models/Page");


const notifyAllMentions = async (content, comment) => {
  // Extract mentions from content (assumes mentions are in "@username" format)
  const mentionRegex = /@(\w+)/g;
  
  const mentionedUsernames = content.match(mentionRegex)?.map(name => name.slice(1)) || [];
  
  if (mentionedUsernames.length === 0) return; // No mentions, exit

  // Update all mentioned users, pushing notification while keeping max 10
  await User.updateMany(
    { username: { $in: mentionedUsernames } },
    {
      $push: {
        notifications: {
          $each: [{ type: "comment", notification: comment }],
          $slice: -10 // Keeps only the latest 10 notifications
        }
      }
    }
  );
};

const create = async (req, res) => {
  try {
    const { content, parentComment } = req.body;
    const { pageId } = req.params;
    const userId = req.user.id;

    // Fetch the Page first (trusted source)
    const page = await Page.findById(pageId);
    if (!page) {
      return res.status(404).json({ success: false, message: "Page not found" });
    }

    const { courseId, section } = page;

    // Verify if parent comment exists (if it's a reply)
    let parent = null;
    if (parentComment) {
      parent = await Comment.findById(parentComment);
      if (!parent || !parent.pageId.equals( pageId) ){
        return res.status(400).json({ success: false, message: "Invalid parent comment" });
      }
    }

    // Create the new comment
    const newComment = await Comment.create({
      content,
      userId,
      courseId,
      pageId,
      section,
      parentComment: parentComment || null,
    });

    // Increment replies count in parent comment (if it's a reply)
    if (parent) {
      await Comment.updateOne({ _id: parentComment }, { $inc: { repliesCount: 1 } });
    }
    notifyAllMentions(content, newComment)
    .catch(error => console.error("Error in notifyAllMentions:", error));
  
    res.status(201).json({ success: true, comment: newComment });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};



const getAll = async (req, res) => {
  try {
    const { pageId, courseId } = req.params; // Using both pageId and courseId from params
    const { skip = 0, limit = 6, parentComment = null } = req.query;

    const filter = { pageId, courseId, parentComment }; // Using courseId directly from params

    const comments = await Comment.find(filter)
      .sort("-createdAt")
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
    const { content } = req.body;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    if (comment.user.equals(userId)) {
      return res.status(403).json({ success: false, message: "Unauthorized to update this comment" });
    }

    comment.content = content;
    await comment.save();
    notifyAllMentions(content, newComment)
    .catch(error => console.error("Error in notifyAllMentions:", error));
    res.status(200).json({ success: true, message: "Comment updated successfully", comment });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



module.exports = {
  create,
  remove,
  getAll,
  getComment,
  update,
};
