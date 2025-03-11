import React from 'react';
import '../styles/CourseCard.css';
import defaultThumbnail from '../assets/DefaultThumbnail.png'; // ✅ Default thumbnail

const CourseCard = ({ course }) => {
  return (
    <div className="cc-container">
      {/* Left Side - Thumbnail (Always Visible) */}
      <div className="cc-thumbnail-wrapper">
        <img 
          src={course.thumbnail || defaultThumbnail} 
          alt="Course Thumbnail" 
          className="cc-thumbnail-image"
        />
      </div>

      {/* Right Side - Course Details */}
      <div className="cc-info">
        <h3 className="cc-course-title">{course.title}</h3>
        <p className="cc-course-meta">
          {course.creator} • {course.students} students • {course.category}
        </p>
        <p className="cc-course-price">${course.price.toFixed(2)}</p>
        <p className="cc-course-rating">⭐ {course.rating}</p>
      </div>
    </div>
  );
};

export default CourseCard;
