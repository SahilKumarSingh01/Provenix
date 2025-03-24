import React, { useState } from "react";
import styles from "../styles/ReviewForm.module.css";
const ReviewForm = ({ review, setFormOpen ,onSubmit}) => {
  const [rating, setRating] = useState(review?.rating || 0);
  const [text, setText] = useState(review?.text || "");

  const handleStarClick = (index) => {
    setRating(index + 1);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.reviewForm}>
        <h3>{review ? "Edit Your Review" : "Leave a Review"}</h3>

        {/* Star Rating */}
        <div className={styles.starRating}>
          {[...Array(5)].map((_, index) => (
            <span
              key={index}
              className={index < rating ? styles.activeStar : styles.inactiveStar}
              onClick={() => handleStarClick(index)}
            >
              ★
            </span>
          ))}
        </div>

        {/* Review Input */}
        <textarea
          className={styles.reviewInput}
          placeholder="Write your review here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button className={styles.submitButton} onClick={() => onSubmit({text,rating})}>
            Submit
          </button>
          <button className={styles.cancelButton} onClick={()=>setFormOpen(false)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;
