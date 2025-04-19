const Enrollment = require("../../models/Enrollment");
const Course = require("../../models/Course");
const razorpay = require("../../config/razorpay");
const extendEnrollmentExpiry  = require("../../utils/extendEnrollmentExpiry"); // Import extendCourseExpiry

const enroll = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        // Fetch course and enrollment in parallel
        let [course, enrollment] = await Promise.all([
            Course.findOne({ _id: courseId, status: "published" })
            .populate("creator", "username photo displayName")
            .lean(),
            Enrollment.findOne({ user: userId, course: courseId })
        ]);

        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found or not published" });
        }

        if (course.price === 0) {
            // If course is free, create enrollment and extend expiry
            if (!enrollment) {
                    [enrollment,course] = await Promise.all([
                    Enrollment.create({
                      user: userId,
                      course: courseId,
                      status: "expired", // Mark as expired initially
                      expiresAt: new Date()
                    }),
                    Course.findOneAndUpdate(
                      { _id: courseId },
                      { $inc: { totalEnrollment: 1 } },
                      {new:true}
                    ).populate("creator", "username photo displayName")
                    .lean()
                  ]);
            }
            await extendEnrollmentExpiry(enrollment._id); 
            console.log(course);
            return res.status(200).json({ success: true, 
                message: "Free course enrolled successfully",
                course:{...course,isEnrolled:true,isCreator:false} });
        }

        let lastOrderIndex = enrollment?.orderIds?.length - 1;
        let lastOrder = lastOrderIndex >= 0 ? enrollment.orderIds[lastOrderIndex] : null;

        if (lastOrder && lastOrder.status !== "paid") {
            const orderDetails = await razorpay.orders.fetch(lastOrder.orderId);
            return res.status(200).json({ success: true, order: orderDetails });
        }

        // Create new Razorpay order
        const order = await razorpay.orders.create({
            amount: course.price * 100, // Convert to paise
            currency: "INR",
            receipt: `receipt_${userId}_${courseId}`,
            notes: { userId, courseId }
        });

        if (!enrollment) {
            // Create a new enrollment with "expired" status
            await Enrollment.create({
                user: userId,
                course: courseId,
                status: "expired",
                expiresAt: new Date(),
                orderIds: [{ orderId: order.id, status: "created" }]
            });
        } else {
            // Update existing enrollment to push new order
            await Enrollment.updateOne(
                { _id: enrollment._id },
                { $push: { orderIds: { orderId: order.id, status: "created" } } }
            );
        }

        res.status(200).json({ success: true, order });

    } catch (error) {
        res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
    }
};

module.exports = enroll;
