import React, { useState, useEffect } from "react";
import styles from "../styles/Reviews.module.css"; // Import CSS module

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Dummy Static Data
        const fakeReviews = [
            { id: 1, user: "John Doe", comment: "Great course!", rating: 5 },
            { id: 2, user: "Jane Smith", comment: "Very helpful and well explained.", rating: 4 },
            { id: 3, user: "Alice Brown", comment: "Decent but could be better.", rating: 3 },
            { id: 4, user: "Mike Johnson", comment: "Absolutely loved it! Must enroll.", rating: 5 },
        ];

        setTimeout(() => {
            setReviews(fakeReviews);
            setLoading(false);
        }, 1500); // Simulating API delay (1.5 sec)
    }, []);

    return (
        <div className={styles.reviewsContainer}>
            <h2 className={styles.reviewsTitle}>Student Reviews</h2>
            {loading ? (
                <p className={styles.loading}>Loading reviews...</p>
            ) : (
                reviews.map((review) => (
                    <div key={review.id} className={styles.reviewCard}>
                        <div className={styles.reviewHeader}>
                            <span className={styles.reviewUser}>{review.user}</span>
                            <span className={styles.reviewRating}>
                                {Array(review.rating).fill("⭐").join("")}
                            </span>
                        </div>
                        <p className={styles.reviewComment}>{review.comment}</p>
                    </div>
                ))
            )}
        </div>
    );
};

export default Reviews;
