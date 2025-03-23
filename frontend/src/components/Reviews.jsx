import React, { useState, useEffect } from "react";
import styles from "../styles/Reviews.module.css"; // Import CSS module
import axios  from '../api/axios';
const Reviews = ({course}) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    console.log(course);
    useEffect(async() => {
        try{
            const {data}=await axios.get(`api/course/${course._id}/review/all`);
            setReviews(data.reviews);
            setLoading(false);
        }catch(error)
        {
            console.log("Review Loading error",error);
        }
    }, []);

    return (
        <div className={styles.reviewsContainer}>
            <h2 className={styles.reviewsTitle}>Student Reviews</h2>
            {loading ? (
                <p className={styles.loading}>Loading reviews...</p>
            ) : reviews.length>0?
                (reviews.map((review) => (
                    <div key={review.id} className={styles.reviewCard}>
                        <div className={styles.reviewHeader}>
                            <span className={styles.reviewUser}>{review.user}</span>
                            <span className={styles.reviewRating}>
                                {Array(review.rating).fill("⭐").join("")}
                            </span>
                        </div>
                        <p className={styles.reviewComment}>{review.comment}</p>
                    </div>))):(<p className={styles.loading}>No reviews</p>)
            }
        </div>
    );
};

export default Reviews;
