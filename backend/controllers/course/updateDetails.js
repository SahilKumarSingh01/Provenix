const Course = require("../../models/Course"); 
const Enrollment=require('../../models/Enrollment');
const updateDetails = async (req, res) => {
    try {
      const course = await Course.findById(req.params.courseId);
      if (!course) return res.status(404).json({ success: false, message: "Course not found" });
  
      // Check if user is the creator
      if (!course.creator.equals(req.user.id))
        return res.status(403).json({ success: false, message: "Unauthorized to update this course" });
      const isEnrolled = await Enrollment.exists({ user: req.user.id, course: course._id, status: "active" });

      // Allow only limited fields if course has enrollments
      const allowedUpdates = ["description", "thumbnail", "tags"];
      const updateData = isEnrolled
        ? Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedUpdates.includes(key)))
        : req.body;
  
      const updatedCourse = await Course.findByIdAndUpdate(req.params.courseId, { $set: updateData }, { new: true });
  
      res.status(200).json({ success: true, message: "Course updated!", course: updatedCourse });
  
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
};
module.exports=updateDetails;
