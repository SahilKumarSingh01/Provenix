const Enrollment = require("../../models/Enrollment");
const razorpay = require("../../config/razorpay");

const verifyPayment = async (req, res) => {
    try {
        const { enrollmentId } = req.params;
        const { index } = req.body;
        const userId = req.user.id;

        // Fetch the enrollment for the given user
        const enrollment = await Enrollment.findOne({ _id: enrollmentId, user: userId });

        if (!enrollment) {
            return res.status(404).json({ success: false, message: "Enrollment not found" });
        }

        // Check if the order index is valid
        if (!enrollment.orderIds[index]) {
            return res.status(400).json({ success: false, message: "Invalid order index" });
        }

        // Get the orderId from the specified index
        const orderId = enrollment.orderIds[index].orderId;

        // Fetch order details and payments in parallel
        const [orderDetails, paymentsResponse] = await Promise.all([
            razorpay.orders.fetch(orderId),
            razorpay.orders.fetchPayments(orderId)
        ]);

        // Extract extended payment details (if available)
        const paymentDetails = paymentsResponse.items.length > 0 ? paymentsResponse.items[0] : null;

        // Update order status in enrollment (parallel execution)
        await Enrollment.updateOne(
            { _id: enrollmentId },
            { $set: { [`orderIds.${index}.status`]: orderDetails.status } }
        );


        // Send updated order & extended payment details to frontend
        res.status(200).json({ 
            success: true, 
            order: orderDetails, 
            payment: paymentDetails || null  
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
    }
};

module.exports = verifyPayment;
