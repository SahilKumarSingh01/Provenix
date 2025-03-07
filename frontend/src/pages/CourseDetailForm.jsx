import React, { useState } from "react";
import ImageUploader from "../components/ImageUpload"; // Import ImageUploader component
import "../styles/CourseDetailForm.css"; // Import the CSS file

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

  // Function to handle image upload
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
    <div className="course-detail-container">
      <h2 className="form-title">Course Details</h2>
      <form onSubmit={handleSubmit} className="course-form">
        <div className="form-group">
          <label>Title:</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Description:</label>
          <textarea name="description" value={formData.description} onChange={handleChange} required />
        </div>

        {/* Image Uploader Component */}
        <div className="form-group">
          <label>Thumbnail:</label>
          <ImageUploader onImageUpload={handleImageUpload} />
          {formData.thumbnail && (
            <div className="thumbnail-preview">
              <img src={formData.thumbnail} alt="Course Thumbnail" />
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Access Type:</label>
          <select name="accessType" value={formData.accessType} onChange={handleChange}>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>

        <div className="form-group">
          <label>Price (Rs.):</label>
          <input type="number" name="price" value={formData.price} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Category:</label>
          <input type="text" name="category" value={formData.category} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Tags (comma-separated):</label>
          <input type="text" name="tags" value={formData.tags} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Level:</label>
          <select name="level" value={formData.level} onChange={handleChange}>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        <button type="submit" className="submit-btn">Submit Details</button>
      </form>
    </div>
  );
};

export default CourseDetailForm;
