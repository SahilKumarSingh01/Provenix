const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Added ref to "User"
  courseId: { type: String, required: true },
  pageId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Links to Lesson or Practice
  moduleId: {type: mongoose.Schema.Types.ObjectId, required: true  },
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null }, // For replies
  repliesCount: { type: Number, default: 0 }, // Number of replies
  reportedBy: [{ type: mongoose.Schema.Types.ObjectId,ref:'User' }], // Array of user IDs who reported the review
  
}, { timestamps: true });

commentSchema.index({ courseId: 1, pageId: 1 });

module.exports = mongoose.model("Comment", commentSchema);
