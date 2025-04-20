const Course = require("../../models/Course"); 
const Enrollment=require('../../models/Enrollment');
const getCourseDetails = async (req, res) => {
    try {
      const course = await Course.findById(req.params.courseId)
                    .populate("creator", "username photo displayName") // Populate creator
                    .lean();
      if (!course) return res.status(404).json({ success: false, message: "Course not found" });
      const userId=req.user?.id;
      const isCreator = course.creator._id.equals(userId);
      const isEnrolled = await Enrollment.exists({ user: userId, course: course._id, status: "active" });
  
      if (!isCreator && course.status !== "published" && !isEnrolled)
        return res.status(403).json({ success: false, message: "Access denied!" });
  
      res.status(200).json({ success: true,message:"Course fetch successfully", course: { ...course, isCreator, isEnrolled } });
  
  
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  module.exports=getCourseDetails;