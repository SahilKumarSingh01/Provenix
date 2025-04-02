const mongoose = require("mongoose");

const insightSectionSchema = new mongoose.Schema({
  pageId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Links to Lesson or Practice
  mouduleId: { type: mongoose.Schema.Types.ObjectId,type: String, required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Direct ObjectId reference to the Course
  userId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Direct ObjectId reference to the User
  contentSectionId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Direct ObjectId reference to the ContentSection
  items: [{ type: mongoose.Schema.Types.Mixed }], // Array of mixed objects
}, { timestamps: true });

module.exports = mongoose.model("InsightSection", insightSectionSchema);
