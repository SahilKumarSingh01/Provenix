const mongoose = require("mongoose");
const Course = require("../../models/Course");

const getStats = async (req, res) => {
  try {
    const creatorId = new mongoose.Types.ObjectId(req.user.id);

    const pipeline = [
      {
        $match: { creator: creatorId },
      },
      {
        $facet: {
          totalCourses: [{ $count: "count" }],

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
                _id: "$level",
                count: { $sum: 1 },
              },
            },
          ],

          avgPrice: [
            {
              $group: {
                _id: null,
                avg: { $avg: "$price" },
              },
            },
          ],

          totalEnrollment: [
            {
              $group: {
                _id: null,
                total: { $sum: "$totalEnrollment" },
              },
            },
          ],

          byCategory: [
            {
              $group: {
                _id: "$category",
                count: { $sum: 1 },
              },
            },
          ],

          paidVsFree: [
            {
              $group: {
                _id: {
                  $cond: [{ $eq: ["$price", 0] }, "free", "paid"],
                },
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ];

    const [result] = await Course.aggregate(pipeline);

    const stats = {
      totalCourses: result.totalCourses[0]?.count || 0,

      statusCounts: result.byStatus.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),

      levelCounts: result.byLevel.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),

      averagePrice: result.avgPrice[0]?.avg?.toFixed(2) || "0.00",

      totalEnrollment: result.totalEnrollment[0]?.total || 0,

      categoryCounts: result.byCategory.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),

      paidVsFree: result.paidVsFree.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error("Error in getMyCourseStats:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = getStats;
