import React from 'react';
import styles from '../styles/CourseCard.module.css';
import defaultThumbnail from '../assets/DefaultThumbnail.png'; // ✅ Default thumbnail

const CourseCard = ({ course }) => {
  return (
    <div className={styles.ccContainer}>
      {/* Left Side - Thumbnail (Always Visible) */}
      <div className={styles.ccThumbnailWrapper}>
        <img 
          src={course.thumbnail || defaultThumbnail} 
          alt="Course Thumbnail" 
          className={styles.ccThumbnailImage}
        />
      </div>

      {/* Right Side - Course Details */}
      <div className={styles.ccInfo}>
        <h3 className={styles.ccCourseTitle}>{course.title}</h3>
        <p className={styles.ccCourseMeta}>
          {course.creator} • {course.students} students • {course.category}
        </p>
        <p className={styles.ccCoursePrice}>${course.price.toFixed(2)}</p>
        <p className={styles.ccCourseRating}>⭐ {course.rating}</p>
      </div>
    </div>
  );
};

export default CourseCard;
