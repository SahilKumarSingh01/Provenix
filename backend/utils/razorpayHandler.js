const Enrollment = require("../models/Enrollment"); // Import Enrollment model

async function handlePaymentCaptured(payment) {
    // TODO: Implement logic for successful payment capture
    console.log("Handling payment captured:", payment);
}

async function handlePaymentFailed(payment) {
    // TODO: Implement logic for failed payment
    console.log("Handling payment failed:", payment);
}


async function handleOrderPaid(order) {
    try {
        console.log("Handling order paid:", order);

        const { userId, courseId } = order.notes; // Extract user and course ID from order notes

        const updatedEnrollment = await Enrollment.updateOne(
            { user: userId, course: courseId, "orderIds.orderId": order.id },
            [
                {
                    $set: {
                        "orderIds.$.status": "paid", // Update order status to "paid"
                        expiresAt: {
                            $add: [
                                { $max: ["$expiresAt", "$$NOW"] }, // Get the later of expiresAt or now
                                30 * 24 * 60 * 60 * 1000 // Add 30 days
                            ]
                        }
                    }
                }
            ]
        );

        if (updatedEnrollment.matchedCount === 0) {
            console.log("No matching enrollment found for the paid order.");
            return { success: false, message: "Enrollment not found" };
        }

        console.log("Enrollment updated successfully:", updatedEnrollment);
        return { success: true };
    } catch (error) {
        console.error("Error handling order paid:", error);
        return { success: false, message: "Internal server error" };
    }
}



async function handleRefundProcessed(refund) {
    // TODO: Implement logic for refund processing
    console.log("Handling refund processed:", refund);
}

async function handleDisputeCreated(dispute) {
    // TODO: Implement logic for dispute creation
    console.log("Handling dispute created:", dispute);
}

async function handleDisputeClosed(dispute) {
    // TODO: Implement logic for dispute resolution
    console.log("Handling dispute closed:", dispute);
}

module.exports = {
    handlePaymentCaptured,
    handlePaymentFailed,
    handleOrderPaid,
    handleRefundProcessed,
    handleDisputeCreated,
    handleDisputeClosed
};
