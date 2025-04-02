const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  pageCollection: { type: mongoose.Schema.Types.ObjectId, ref: "PageCollection" },
});

const moduleCollectionSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  creatorId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  modules: [moduleSchema] // Array of modules
}, { timestamps: true });

module.exports = mongoose.model("ModuleCollection", moduleCollectionSchema);
