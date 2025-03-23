const Review = require("../models/Review.js");
const Enrollment = require("../models/Enrollment");

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
    const review = await Review.create({ courseId, user, rating, text });
    res.status(201).json({ message: "Review added successfully", review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const myReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

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

    const result = await Review.deleteOne({ _id: reviewId, user });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Review not found or Unauthorized" });
    }

    return res.status(200).json({ message: "Review deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const user = req.user.id;
    const { rating, text } = req.body;

    // Update review directly using reviewId and user both together
    const review = await Review.findOneAndUpdate(
      { _id: reviewId, user },
      { rating, text },
      { new: true } // This will return the updated review
    ).populate('user'); // Optionally populate the user field if needed

    if (!review) {
      return res.status(404).json({ message: "Review not found or Unauthorized" });
    }

    return res.status(200).json({ message: "Review updated successfully", review });


  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  create,
  getAll,
  remove,
  update,
  myReview,
};
