const Course = require("../../models/Course");
const searchCourses = async (req, res) => {
    try {
      const { keyword, category, tags, level, minPrice, maxPrice, limit = 10, skip = 0, sortBy = "createdAt", order = -1 } = req.body;
      const matchStage = { status: "published" };
  
      if (tags) matchStage.tags = { $in: tags.split(",") };
      if (category) matchStage.category = new RegExp(`^${category}$`, "i");
      if (level) matchStage.level = level;
      if (minPrice || maxPrice) {
        matchStage.price = {};
        if (minPrice) matchStage.price.$gte = Number(minPrice);
        if (maxPrice) matchStage.price.$lte = Number(maxPrice);
      }
  
      const pipeline = [{ $match: matchStage }];
      
      pipeline.push({
        $addFields: {
          avgRating: {
            $cond: {
              if: { $eq: ["$numberOfRatings", 0] },
              then: 0,
              else: {
                $divide: ["$totalRating", "$numberOfRatings"],
              },
            },
          },
        },
      });
  
      if (keyword) {
        const words = keyword.trim().split(/\s+/).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
        const regexArray = words.map(word => new RegExp(word, "i"));
  
        pipeline.push({
          $addFields: {
            matchCount: {
              $size: {
                $filter: {
                  input: regexArray,
                  as: "regex",
                  cond: { $regexMatch: { input: "$title", regex: "$$regex" } }
                }
              }
            }
          }
        });
  
        pipeline.push({ $match: { matchCount: { $gt: 0 } } });
        pipeline.push({ $sort: { matchCount: -1 ,[sortBy]: order} });
      }
      else {
        pipeline.push({ $sort: { [sortBy]: order } });
      }
      pipeline.push({ $skip: Number(skip) }, { $limit: Number(limit) });
      

      pipeline.push({
        $lookup: {
          from: "users", // Collection name in MongoDB (pluralized)
          localField: "creator",
          foreignField: "_id",
          as: "creator",
        }
      });
      pipeline.push({ $unwind: "$creator" }); 
    
      const courses = await Course.aggregate(pipeline);
      res.status(200).json({ success: true, courses });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
};
module.exports=searchCourses;