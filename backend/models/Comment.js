const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  courseId: { type: String, required: true },
  pageId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Links to Lesson or Practice
  section: { type: String, required: true }, 
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null }, // For replies
  repliesCount: { type: Number, default: 0 }, // Number of replies
}, { timestamps: true });
commentSchema.index({ courseId: 1, section: 1 });

module.exports = mongoose.model("Comment", commentSchema);
