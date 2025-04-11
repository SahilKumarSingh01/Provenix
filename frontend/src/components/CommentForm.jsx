import React, { useState } from "react";
import styles from "../styles/CommentForm.module.css";

const CommentForm = ({ initialText = "", onSubmit, onCancel }) => {
  const [text, setText] = useState(initialText);

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText("");
  };

  return (
    <div className={styles.overlay}>
    
      <div className={styles.commentForm}>
        <textarea
          className={styles.commentInput}
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className={styles.actions}>
          <button className={styles.submitButton} onClick={handleSubmit}>
            Post
          </button>
          <button className={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentForm;
