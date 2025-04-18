const mongoose = require("mongoose");
const Enrollment = require("../../models/Enrollment");

const getStats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const pipeline = [
      {
        $match: { user: userId },
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
        $addFields: {
          completedPagesCount: { $size: "$completedPages" },
          totalPages: "$course.totalPages",
          progressPercent: {
            $cond: [
              { $gt: ["$course.totalPages", 0] },
              {
                $multiply: [
                  { $divide: [{ $size: "$completedPages" }, "$course.totalPages"] },
                  100,
                ],
              },
              0,
            ],
          },
        },
      },
      {
        $facet: {
          totalEnrolled: [{ $count: "count" }],
          byStatus: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
          ],
          byLevel: [
            {
              $group: {
                _id: "$course.level",
                count: { $sum: 1 },
              },
            },
          ],
          avgProgress: [
            {
              $group: {
                _id: null,
                avgProgress: { $avg: "$progressPercent" },
              },
            },
          ],
          paidVsFree: [
            {
              $group: {
                _id: {
                  $cond: [{ $eq: ["$course.price", 0] }, "free", "paid"],
                },
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ];

    const [result] = await Enrollment.aggregate(pipeline);

    const stats = {
      totalEnrolled: result.totalEnrolled[0]?.count || 0,
      statusCounts: result.byStatus.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      levelCounts: result.byLevel.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      averageProgress: result.avgProgress[0]?.avgProgress?.toFixed(2) || "0.00",
      paidVsFree: result.paidVsFree.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error("Error in getEnrollStats:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = getStats;
