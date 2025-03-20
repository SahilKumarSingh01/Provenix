const mongoose = require("mongoose");

const orderIdSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  status: { type: String, enum: ["created", "attempted", "paid"], required: true, default: "created" }
}, { timestamps: true });

const enrollmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  completedPages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Page" }],
  orderIds: [orderIdSchema],
  status: { type: String, enum: ["active", "expired"], default: "active" },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

enrollmentSchema.index({ course: 1, status: 1 });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
