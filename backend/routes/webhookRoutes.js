const express = require("express");
const crypto = require("crypto");
const routes = express.Router();
const razorHandler = require("../utils/razorpayHandler");

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET; // Store in .env

routes.post("/razorpay-webhook", async (req, res) => {
    try {
        const signature = req.headers["x-razorpay-signature"];
        const payload = JSON.stringify(req.body);

        // Verify signature
        const expectedSignature = crypto
            .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
            .update(payload)
            .digest("hex");

        if (signature !== expectedSignature) {
            console.error("Invalid Razorpay webhook signature");
            return res.status(400).json({ success: false, message: "Invalid signature" });
        }

        // Process events after signature verification
        const event = req.body.event;
        switch (event) {
            case "payment.captured":
                await razorHandler.handlePaymentCaptured(req.body.payload.payment.entity);
                break;
            case "payment.failed":
                await razorHandler.handlePaymentFailed(req.body.payload.payment.entity);
                break;
            case "order.paid":
                await razorHandler.handleOrderPaid(req.body.payload.order.entity);
                break;
            case "refund.processed":
                await razorHandler.handleRefundProcessed(req.body.payload.refund.entity);
                break;
            case "dispute.created":
                await razorHandler.handleDisputeCreated(req.body.payload.dispute.entity);
                break;
            case "dispute.closed":
                await razorHandler.handleDisputeClosed(req.body.payload.dispute.entity);
                break;
            default:
                console.log(`Unhandled event: ${event}`);
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Webhook Handling Error:", error);
        res.status(500).json({ success: false, message: "Webhook handling failed" });
    }
});

module.exports = routes;
