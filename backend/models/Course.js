const mongoose = require("mongoose");


const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail: { type: String }, // No default value, will be undefined if not provided

  status: {
    type: String,
    enum: ["draft", "published", "deleted"],
    default: "draft",
  },

  price: { type: Number, default: 0 },
  category: { type: String, required: true },
  tags: [{ type: String }],
  level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
  creator: { type: mongoose.Schema.Types.ObjectId, required: true ,ref:"User"},

  totalEnrollment: { type: Number, default: 0 }, // Keeps track of enrolled users count but not active user

  videoCount: { type: Number, default: 0 },
  codeCount: { type: Number, default: 0 },
  pageCount: { type: Number, default: 0 }, // Represents total SectionItems (Pages) in the course

  totalRating: { type: Number, default: 0 },
  numberOfRatings: { type: Number, default: 0 },

  moduleCollection: { type: mongoose.Schema.Types.ObjectId, ref: "ModuleCollection" }, // Reference to ModuleCollection
 
  reportedBy: [{ type: mongoose.Schema.Types.ObjectId,ref:'User' }], // Array of user IDs who reported the review

}, { timestamps: true });

courseSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Course", courseSchema);
