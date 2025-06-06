const Enrollment = require("../../models/Enrollment");
const razorpay = require("../../config/razorpay");
const User =require("../../models/User");
const extendEnrollmentExpiry  = require("../../utils/extendEnrollmentExpiry"); // Import extendCourseExpiry
const Course = require("../../models/Course");

const verifyPayment = async (req, res) => {
    try{
        const {orderId}=req.body;
        const {enrollmentId}=req.params;
        // const orderDetails = await razorpay.orders.fetch(orderId);
        // console.log("here ",orderDetails);]
        const [order,paymentCollection,enrollment]=await Promise.all([
            razorpay.orders.fetch(orderId),
            razorpay.orders.fetchPayments(orderId),
            Enrollment.findById(enrollmentId).populate("course"),
        ]);
        // console.log(order);
        const payment=paymentCollection.items[0];
        const course=enrollment.course;
        if(!order)
            return res.status(400).json({message:"OrderId is not valid"});
        if(!payment)
            return res.status(400).json({message:"payment is not made try again!"});
        if(order.status=="paid")
            return res.status(400).json({message:"Your order is already accepted"});
        if(course.status!=='published'){
            await Enrollment.findByIdAndUpdate(enrollmentId,{$set:{[`orderIds.${order.notes.orderIndex}.status`]:'refunded'}});
            return res.status(400).json({message:"course is not longer available"});
        }
        // console.log(payment);
        const [updatedPayment,updatedEnrollment]=await Promise.all([
            razorpay.payments.capture(payment.id,payment.amount,payment.currency),
            Enrollment.findByIdAndUpdate(enrollmentId,{$set:{[`orderIds.${order.notes.orderIndex}.status`]:'accepted'}}),
            extendEnrollmentExpiry(enrollment._id),
        ]) 
        res.status(200).json({message:"Successfully updated ",enrollment:updatedEnrollment});

    }catch(err){
        console.log(err);
        res.status(500).json({message:"fail to verify payments status",error:err})
    }
};

module.exports = verifyPayment;
