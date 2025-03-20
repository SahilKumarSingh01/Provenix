const Enrollment = require("../models/Enrollment");

async function extendEnrollmentExpiry(userId, courseId) {
    try {
        const updatedEnrollment = await Enrollment.updateOne(
            { user: userId, course: courseId },
            [
                {
                    $set: {
                        expiresAt: {
                            $add: [
                                { $max: ["$expiresAt", "$$NOW"] }, // Extend from the latest expiry or now
                                30 * 24 * 60 * 60 * 1000 // Add 30 days
                            ]
                        }
                    }
                }
            ]
        );

        return updatedEnrollment;
    } catch (error) {
        console.error("Error extending enrollment expiry:", error);
        throw error;
    }
}

module.exports =  extendEnrollmentExpiry ;
