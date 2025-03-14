const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  payment: {
    amount: { type: Number, default: 0 },
    transactionId: { type: String },
    status: { type: String, enum: ["pending", "completed", "failed"], default: "completed" },
  },
  status: {
    type: String,
    enum: ["active", "expired"],
    default: "active",
  },
  expiresAt: {
    type: Date, // Expiry date
    required: true,
  },
}, { timestamps: true });

enrollmentSchema.index({ course: 1, status: 1 });


module.exports = mongoose.model("Enrollment", enrollmentSchema);
