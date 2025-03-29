const mongoose = require("mongoose");

const pageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: mongoose.Schema.Types.ObjectId, ref: "ContentSection" },
  order: { type: Number, required: true }, // Controls sorting
  courseId: { type: mongoose.Schema.Types.ObjectId, required: true }, 
  creatorId: { type: mongoose.Schema.Types.ObjectId, required: true }, 
  sectionId: {type: mongoose.Schema.Types.ObjectId, required: true  },
  commentCount: { type: Number, default: 0 }, // Tracks number of comments
}, { timestamps: true });
pageSchema.index({ courseId: 1, section: 1 });

module.exports = mongoose.model("Page", pageSchema);
