const mongoose = require("mongoose");
const Enrollment = require("../../models/Enrollment");

const getEnrolledCourses = async (req, res) => {
  try {
    let { skip = 0, limit = 6, sortBy = "createdAt", order = -1, status, level } = req.query;

    skip = parseInt(skip);
    limit = parseInt(limit);
    order = parseInt(order);

    const pipeline = [
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user.id),
        },
      },
      {
        $addFields: {
          completedPagesSize: { $size: "$completedPages" },
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "course",
          foreignField: "_id",
          as: "course",
        },
      },
      { $unwind: "$course" },
      {
        $lookup: {
          from: "users",
          localField: "course.creator",
          foreignField: "_id",
          as: "course.creator",
        },
      },
      { $unwind: "$course.creator" },
      {
        $match: {
          ...(status ? { status } : {}),
          ...(level ? { "course.level": level } : {}),
        },
      },
      {
        $sort: {
          [sortBy]: order,
        },
      },
      { $skip: skip },
      { $limit: limit },
    ];

    const enrollments = await Enrollment.aggregate(pipeline);

    res.json({
      success: true,
      enrollments,
    });
  } catch (error) {
    console.error("Aggregation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = getEnrolledCourses;
