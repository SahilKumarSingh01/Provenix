const Enrollment=require('../../models/Enrollment');
const getEnrolledCourses = async (req, res) => {
    try {
      const { skip = 0, limit = 6, sortBy = "createdAt", order = -1 } = req.query;

      skip = parseInt(skip);
      limit = parseInt(limit);
      order = parseInt(order); 

      const enrollments = await Enrollment.find({ user: req.user.id })
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "course",
          populate: {
            path: "creator", // Populating creator inside course
            select: "username photo displayName", // Only fetch required fields
          },
        })
        .lean();
  
      res.json({ success: true, enrollments });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
};
module.exports=getEnrolledCourses;