const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: [{
    type: { type: String, enum: ["heading", "paragraph", "code", "image", "video"], required: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
  }],
}, { timestamps: true });

const lessonSectionSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  creator: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  lessons: [lessonSchema], // Embedded lessons with auto `_id`
}, { timestamps: true });

/**
 * Add a new lesson to the section
 */
lessonSectionSchema.methods.addLesson = async function (title, content) {
  const lesson = { title, content }; // No need to manually set `_id`
  this.lessons.push(lesson);
  await this.save();
  return this.lessons[this.lessons.length - 1]; // Return the newly added lesson
};

module.exports = mongoose.model("LessonSection", lessonSectionSchema);
