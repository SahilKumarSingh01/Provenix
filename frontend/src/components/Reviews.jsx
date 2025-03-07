import React, { useState, useEffect } from "react";
import "../styles/Reviews.css"; // Import CSS file

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Dummy Static Data
        const fakeReviews = [
            { id: 1, user: "John Doe", comment: "Great course!", rating: 5 },
            { id: 2, user: "Jane Smith", comment: "Very helpful and well explained.orem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum", rating: 4 },
            { id: 3, user: "Alice Brown", comment: "Decent but could be better.", rating: 3 },
            { id: 4, user: "Mike Johnson", comment: "Absolutely loved it! Must enroll.", rating: 5 },
        ];

        setTimeout(() => {
            setReviews(fakeReviews);
            setLoading(false);
        }, 1500); // Simulating API delay (1.5 sec)
    }, []);

    return (
        <div className="reviews-container">
            <h2 className="reviews-title">Student Reviews</h2>
            {loading ? (
                <p className="loading">Loading reviews...</p>
            ) : (
                reviews.map((review) => (
                    <div key={review.id} className="review-card">
                        <div className="review-header">
                            <span className="review-user">{review.user}</span>
                            <span className="review-rating">
                                {Array(review.rating).fill("⭐").join("")}
                            </span>
                        </div>
                        <p className="review-comment">{review.comment}</p>
                    </div>
                ))
            )}
        </div>
    );
};

export default Reviews;




// [
//     { "id": 1, "user": "John Doe", "comment": "Great course!", "rating": 5 },
//     { "id": 2, "user": "Jane Smith", "comment": "Very helpful and well explained.", "rating": 4 },
//     { "id": 3, "user": "Alice Brown", "comment": "Decent but could be better.", "rating": 3 },
//     { "id": 4, "user": "Mike Johnson", "comment": "Absolutely loved it! Must enroll.", "rating": 5 }
//   ]
//   Backend API ka response aise hona chahiye:

  
  