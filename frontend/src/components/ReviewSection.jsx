import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import AvgRating from "./AvgRating";
import ReviewForm from "./ReviewForm";
import ReviewCard from "./ReviewCard";
import styles from "../styles/ReviewSection.module.css"; // Import CSS module
import axios from "../api/axios";
import { toast } from "react-toastify";
import { useCache } from "../context/CacheContext.jsx";


const ReviewSection = ({ course }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [myReview, setMyReview] = useState({});
    const { setCache}=useCache(); 
    const [skip, setSkip] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const limit = 3;

    const { user } = useContext(AuthContext);
    const canReview = course.isEnrolled&&user._id !== course.creator._id;
    // Fetch Reviews
    const fetchReviews = async (reset = false) => {
        try {
            setLoading(true);
            const { data } = await axios.get(`/api/course/${course._id}/review/all`, {
                params: { skip: reset ? 0 : skip, limit: limit + 1 },
            });

            setReviews((prev) => (reset ? data.reviews.slice(0, limit) : [...prev, ...data.reviews.slice(0, limit)]));
            setSkip(reset ? limit : skip + limit);
            setHasNext(data.reviews.length > limit);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch reviews");
        } finally {
            setLoading(false);
        }
    };
    // Fetch my review separately
    const fetchMyReview = async () => {
        try {
            if(!user)return;
            const { data } = await axios.get(`/api/course/${course._id}/review/my-review`);
            setMyReview(data.review || null);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch your review");
        }
    };

    useEffect(() => {
        fetchReviews(true);
        fetchMyReview();
    }, []);

    const onReviewSubmit = async ({ text, rating }) => {
        try {
            const {data}=myReview?._id
                ? await axios.put(`/api/course/${course._id}/review/${myReview._id}`, { text, rating })
                : await axios.post(`/api/course/${course._id}/review/create`, { text, rating });

            toast.success(data.message);
            setFormOpen(false);
            setCache(course._id,data.course);
            const review=data.review;
            fetchReviews(true);
            fetchMyReview();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit review");
        }
    };
    const handleDeleteReview = async () => {
        try {
            await axios.delete(`/api/course/${course._id}/review/${myReview._id}`);
            toast.success("Review deleted successfully");
            fetchReviews(true);
            fetchMyReview();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete review");
        }
    };

    return (
        <div className={styles.reviewsContainer}>
            <h2 className={styles.reviewsTitle}>Verified Reviews</h2>
            <div className={styles.reviewHeader}>
                <div className={styles.ratingWrapper}>
                    Average Rating: <AvgRating course={course} />
                </div>
                <div className={styles.reviewActionsWrapper}>
                    {!myReview?._id ? (
                        <button className={styles.addReviewButton} onClick={() => setFormOpen(true)} disabled={!canReview}>
                            Add Review
                        </button>
                    ) : (
                        <>
                            <button className={styles.editReviewButton} onClick={() => setFormOpen(true)}>Edit Review</button>
                            <button className={styles.deleteReviewButton} onClick={handleDeleteReview}>Delete Review</button>
                        </>
                    )}
                </div>
            </div>

            {/* Review Form */}
            {formOpen && <ReviewForm review={myReview} setFormOpen={setFormOpen} onSubmit={onReviewSubmit} />}

            {/* Review List */}
            {loading && reviews.length === 0 ? (
                <p className={styles.loading}>Loading reviews...</p>
            ) : (
                <div className={styles.reviewList}>
                    {reviews.length > 0 ? reviews.map((review) => <ReviewCard key={review._id} review={review} />) : <p className={styles.loading}>No reviews found.</p>}
                </div>
            )}

            {/* Load More Button */}
            <div className={styles.pagination}>
                {hasNext && (
                    <button onClick={() => fetchReviews()} disabled={loading} className={styles.loadMoreButton}>
                        {loading ? "Loading..." : "Load More"}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ReviewSection;
