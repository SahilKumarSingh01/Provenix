const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref:"User", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("Review", reviewSchema);

