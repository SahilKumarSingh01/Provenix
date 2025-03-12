import React, { useState } from "react";
import ImageUploader from "../components/ImageUpload"; // Import ImageUploader component
import styles from "../styles/CourseDetailForm.module.css"; // Import CSS module

const CourseDetailForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thumbnail: "", // Now this will be set by ImageUploader
    accessType: "public",
    price: "",
    category: "",
    tags: "",
    level: "Beginner",
  });

  const handleImageUpload = (imageUrl) => {
    setFormData({ ...formData, thumbnail: imageUrl });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted Data:", formData);
  };

  return (
    <div className={styles.courseDetailContainer}>
      <h2 className={styles.formTitle}>Course Details</h2>
      <form onSubmit={handleSubmit} className={styles.courseForm}>
        <div className={styles.formGroup}>
          <label>Title:</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required />
        </div>

        <div className={styles.formGroup}>
          <label>Description:</label>
          <textarea name="description" value={formData.description} onChange={handleChange} required />
        </div>

        <div className={styles.formGroup}>
          <label>Thumbnail:</label>
          <ImageUploader onImageUpload={handleImageUpload} />
          {formData.thumbnail && (
            <div className={styles.thumbnailPreview}>
              <img src={formData.thumbnail} alt="Course Thumbnail" />
              <button type="button" onClick={() => setFormData({ ...formData, thumbnail: "" })}>
                Remove
              </button>
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Access Type:</label>
          <select name="accessType" value={formData.accessType} onChange={handleChange}>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Price (Rs.):</label>
          <input type="number" name="price" value={formData.price} onChange={handleChange} min="0" required />
        </div>

        <div className={styles.formGroup}>
          <label>Category:</label>
          <input type="text" name="category" value={formData.category} onChange={handleChange} required />
        </div>

        <div className={styles.formGroup}>
          <label>Tags (comma-separated):</label>
          <input type="text" name="tags" value={formData.tags} onChange={handleChange} required />
        </div>

        <div className={styles.formGroup}>
          <label>Level:</label>
          <select name="level" value={formData.level} onChange={handleChange}>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        <button type="submit" className={styles.submitBtn}>Submit Details</button>
      </form>
    </div>
  );
};

export default CourseDetailForm;
