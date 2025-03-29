const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["heading", "text", "code", "MCQ", "hidden", "reference"],
    required: true,
  },
  data: { type: mongoose.Schema.Types.Mixed, required: true }, // Holds actual data or nested reference
});

const contentSectionSchema = new mongoose.Schema({
  pageId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Links to Lesson or Practice
  sectionId: {type: mongoose.Schema.Types.ObjectId, required: true  },
  courseId: { type: mongoose.Schema.Types.ObjectId, required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, required: true },
  items: [itemSchema], 
  parentContent: { type: mongoose.Schema.Types.ObjectId, ref: "ContentSection", default: null }, // For nesting
  status: { type: String, enum: ["active", "deleted"], default: "active" }, // Soft delete status
}, { timestamps: true });

contentSectionSchema.index({ courseId: 1, section: 1 });

module.exports = mongoose.model("ContentSection", contentSectionSchema);
