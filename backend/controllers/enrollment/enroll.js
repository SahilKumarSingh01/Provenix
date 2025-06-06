const Enrollment = require("../../models/Enrollment");
const Course = require("../../models/Course");
const razorpay = require("../../config/razorpay");
const extendEnrollmentExpiry  = require("../../utils/extendEnrollmentExpiry"); // Import extendCourseExpiry

const enroll = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;
        // Fetch course and enrollment in parallel
        let [course,enrollment] = await Promise.all([
            Course.findOne({ _id: courseId, status: "published" })
            .populate("creator", "username photo displayName accountId activatedAccount")
            .lean(),
            Enrollment.findOne({course:courseId,user:userId})
        ]);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found or not published" });
        }
        if(course.creator._id.equals(req.user.id))
            return res.status(400).json({success:false,message:"You can't enroll in your own course"});

        if(!enrollment){
            [course,enrollment]= await Promise.all([
                Course.findOneAndUpdate({_id:courseId},{$inc:{totalEnrollment:1}},{new:true})
                    .populate("creator", "username photo displayName accountId activatedAccount")
                    .lean(),
                Enrollment.create({user:userId,course:courseId,status:"expired",expiresAt:new Date()}),
            ])
        }

        // const enrollment =await Enrollment.findOneAndUpdate({course:courseId,user:userId},{},{upsert:true,new:true});
        if (course.price === 0) {
            enrollment=await extendEnrollmentExpiry(enrollment._id); 
            return res.status(200).json({ success: true, 
                message: "Free course enrolled successfully",
                course:{...course,isEnrolled:true,isCreator:false} ,
                enrollment,
            });
        }

        let lastOrderIndex = enrollment.orderIds.length?enrollment.orderIds.length-1:-1 ;
        let lastOrder = lastOrderIndex >= 0 ? enrollment.orderIds[lastOrderIndex] : null;

        if (lastOrder && lastOrder.status === "created") {
            const orderDetails = await razorpay.orders.fetch(lastOrder.orderId);
            if(orderDetails.amount===course.price * 100){//if price changes don't provide old order
                return res.status(200).json({ 
                    success: true,
                    order: orderDetails,
                    message:"Looks like your last payment didn't go through. Please try again to complete your enrollment!",
                    course:{...course,isEnrolled:false,isCreator:false} ,
                    enrollment,
                });
            }
        }
    
        // Create new Razorpay order
        const order = await razorpay.orders.create({
                amount: course.price * 100, // Convert to paise
                currency: "INR",
                notes: { enrollmentId:enrollment.id,creator:course.creator._id,orderIndex:lastOrderIndex+1},
                transfers:course.creator.activatedAccount&&course.price>=2?[
                    {
                        account: course.creator.accountId ,
                        amount: course.price*90,
                        currency: "INR",
                    }
                ]:[],
            })

        // Update existing enrollment to push new order
        await Enrollment.updateOne(
            { _id: enrollment._id },
            { $push: { orderIds: { orderId: order.id, status: "created" } } }
        );
        res.status(200).json({ 
            success: true ,
            order,
            message:"Your order for course is created",
            course:{...course,isEnrolled:false,isCreator:false} ,
            enrollment,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
    }
};

module.exports = enroll;
