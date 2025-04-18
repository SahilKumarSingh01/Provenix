const mongoose = require("mongoose");

const pageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  contentSection: { type: mongoose.Schema.Types.ObjectId, ref: "ContentSection" }
});

const pageCollectionSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, required: true },
  moduleId: { type: mongoose.Schema.Types.ObjectId, required: true},
  pages: [pageSchema] // Array of pages with unique IDs
}, { timestamps: true });

module.exports = mongoose.model("PageCollection", pageCollectionSchema);
