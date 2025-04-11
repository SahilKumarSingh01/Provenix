const mongoose = require("mongoose");

const insightSectionSchema = new mongoose.Schema({
  pageId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Links to Lesson or Practice
  moduleId: { type: mongoose.Schema.Types.ObjectId, required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  contentSectionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  insights: [{
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true }, // ID of the item being annotated
    data: { type: mongoose.Schema.Types.Mixed, required: true }   // The actual insight content
  }],
}, { timestamps: true });

module.exports = mongoose.model("InsightSection", insightSectionSchema);
