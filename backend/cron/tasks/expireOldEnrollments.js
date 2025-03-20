const Enrollment = require("../../models/Enrollment");

const expireOldEnrollments = async () => {
  try {
    const now = new Date();

    // Find and update expired enrollments
    const result = await Enrollment.updateMany(
      { expiresAt: { $lte: now }, status: "active" }, // Find active enrollments past expiry
      { $set: { status: "expired" } } // Set them to expired
    );

    console.log(`[CRON] Expired ${result.modifiedCount} enrollments.`);
  } catch (error) {
    console.error("[CRON] Error expiring enrollments:", error);
  }
};

module.exports = expireOldEnrollments;
