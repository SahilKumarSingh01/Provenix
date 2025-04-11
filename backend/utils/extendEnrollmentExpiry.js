const Enrollment = require("../models/Enrollment");

async function extendEnrollmentExpiry(enrollmentId) {
    try {
        const updated = await Enrollment.updateOne(
            { _id:enrollmentId },
            [
                {
                    $set: {
                        expiresAt: {
                            $add: [
                                {
                                    $cond: {
                                        if: { $gt: ["$expiresAt", "$$NOW"] },
                                        then: "$expiresAt",
                                        else: "$$NOW"
                                    }
                                },
                                30 * 24 * 60 * 60 * 1000 // 30 days in ms
                            ]
                        },
                        status: "active"
                    }
                }
            ]
        );
        return updated;
    } catch (error) {
        console.error("Error extending enrollment expiry:", error);
        throw error;
    }
}

module.exports = extendEnrollmentExpiry;
