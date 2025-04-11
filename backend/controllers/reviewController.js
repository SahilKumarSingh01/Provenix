const Review = require("../models/Review.js");
const Enrollment = require("../models/Enrollment");
const Course=require('../models/Course')

const  MAX_REPORT=2;

const create = async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = req.user.id;
    const { rating, text } = req.body;

      const [enrollment, existingReview] = await Promise.all([
        Enrollment.findOne({ course: courseId, user }),
        Review.findOne({ courseId, user })
      ]);

      if (!enrollment) {
        return res.status(403).json({ message: "You must be enrolled to leave a review" });
      }

      if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this course", existingReview });
      }
    // Create new review
    const createdReview = await Review.create({ courseId, user, rating, text });
      const review = await Review.findById(createdReview._id)
            .populate("user", "username photo displayName")
            .lean(); // Convert to plain JS object
    // Update course rating stats atomically
    const course = await Course.findByIdAndUpdate(
      courseId,
      {
        $inc: {
          totalRating: rating,
          numberOfRatings: 1
        }
      },
      { new: true } // So you get the updated course doc back if needed
    )
    .populate("creator", "username photo displayName")
    .lean(); // Convert to plain JS object

    res.status(201).json({ message: "Review added successfully", course:{...course,isEnrolled:true,isCreator:false} ,review});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const myReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = req.user.id;

    // Find the user's review for the given course
    const review = await Review.findOne({ courseId, user }).populate("user", "username photo displayName");

    res.json({ success: true, review });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const getAll = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { skip = 0, limit = 6 } = req.query;
    // Fetch reviews for the given course
    const reviews = await Review.find({ courseId })
                          .sort('-updatedAt')
                          .skip(skip)
                          .limit(limit)
                          .populate("user", "username photo displayName");
    res.json({ reviews});

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const user = req.user.id;

    const review = await Review.findOneAndDelete({ _id: reviewId, user });

    if (!review) {
      return res.status(404).json({ message: "Review not found or Unauthorized" });
    }
    const course = await Course.findByIdAndUpdate(
      review.courseId,
      {
        $inc: {
          totalRating: -review.rating,
          numberOfRatings: -1
        }
      },
      { new: true } // So you get the updated course doc back if needed
    )
    .populate("creator", "username photo displayName")
    .lean(); // Convert to plain JS object
    return res.status(200).json({ message: "Review deleted successfully",course:{...course,isEnrolled:true,isCreator:false}  });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const report=async(req,res)=>{
  try {
    const { reviewId } = req.params;
    const user = req.user.id;

    // Update review directly using reviewId and user both together
    const review = await Review.findOneAndUpdate(
      { _id: reviewId },
      { $addToSet:{reportedBy:user} },
      { new: true } // This will return the updated review
    )
    if (!review) {
      return res.status(404).json({ message: "Review not found " });
    }
    if(review.reportedBy.length>=MAX_REPORT)
    {
        const deletedReview=await Review.findOneAndDelete({_id:reviewId});
        await Course.findByIdAndUpdate(
          deletedReview.courseId,
          {$inc: {totalRating: -deletedReview.rating,numberOfRatings: -1}},
          { new: true } // So you get the updated course doc back if needed
        )
        .populate("creator", "username photo displayName")
        .lean(); // Convert to plain JS object
        return res.status(200).json({ message: "Review has been deleted after exceeding report limit" });

    }

    return res.status(200).json({ message: "Review reported successfully", review });


  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const update = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const user = req.user.id;
    const { rating, text } = req.body;

    // Update review directly using reviewId and user both together
    const review = await Review.findOneAndUpdate(
      { _id: reviewId, user },
      { rating, text },
      { new: false } // This will return the updated review
    ).populate("user", "username photo displayName"); // Optionally populate the user field if needed

    if (!review) {
      return res.status(404).json({ message: "Review not found or Unauthorized" });
    }
    const course = await Course.findByIdAndUpdate(
      review.courseId,
      {
        $inc: {
          totalRating: rating-review.rating
        }
      },
      { new: true } // So you get the updated course doc back if needed
    ) 
    .populate("creator", "username photo displayName")
    .lean(); // Convert to plain JS object


    return res.status(200).json({ message: "Review updated successfully", course:{...course,isEnrolled:true,isCreator:false} ,review});


  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



module.exports = {
  create,
  getAll,
  report,
  remove,
  update,
  myReview,
};
