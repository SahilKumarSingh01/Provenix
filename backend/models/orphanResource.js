const mongoose = require("mongoose");

const orphanResourceSchema = new mongoose.Schema(
  {
    publicId: { type: String, required: true, unique: true ,index:true},
    type: { type: String, enum: ["image", "video", "other"], required: true },
    category: { 
      type: String, 
      enum: ["profile", "thumbnail", "pagePhoto", "pageVideo"], 
      required: true 
    },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 10 * 60 * 1000) }, // 10 min expiry
  },
  { timestamps: true }
);

module.exports = mongoose.model("OrphanResource", orphanResourceSchema);
