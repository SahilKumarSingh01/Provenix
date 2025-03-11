const Review = require("../models/Review.js");
const Enrollment = require("../models/Enrollment");

const create = async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = req.user.id;
    const { rating, text } = req.body;

    // Ensure the user has enrolled in the course before allowing a review
    const enrollment = await Enrollment.findOne({ course:courseId, user });//review is allowed even if inactive
    if (!enrollment) {
      return res.status(403).json({ message: "You must be enrolled to leave a review" });
    }

    const existingReview = await Review.findOne({ courseId, user });
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this course",existingReview });
    }

    // Create new review
    const review = new Review({ courseId, user, rating, text });
    await review.save();

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
    const review = await Review.findOne({ courseId, userId }).populate("userId", "username photo displayName");

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
                          .populate("userId", "username photo displayName");
    res.json({ reviews ,canReview});

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const user = req.user.id;

    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    // Ensure only the creator can delete the review
    if (!review.user.equals(user)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Delete the review
    await Review.deleteOne({ _id: reviewId });

    res.json({ message: "Review deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const user = req.user.id;
    const { rating, text } = req.body;

    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    // Ensure only the creator can update the review
    if (!review.user.equals(user)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update the review fields
    if (rating !== undefined) review.rating = rating;
    if (text !== undefined) review.text = text;

    await review.save();

    res.json({ message: "Review updated successfully", review });

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
