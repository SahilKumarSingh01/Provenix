import React from 'react';
import { Link } from 'react-router-dom'; // ✅ For clickable profile
import styles from '../styles/CourseCard.module.css';
import defaultThumbnail from '../assets/DefaultThumbnail.png';
import defaultProfile from '../assets/defaultPicture.png'; // ✅ Default profile picture

const CourseCard = ({ course }) => {
  return (
    <div className={styles.ccContainer}>
      {/* Left Side - Thumbnail + Educator Profile */}
      <div className={styles.ccThumbnailWrapper}>
        <img 
          src={course.thumbnail || defaultThumbnail} 
          alt="Course Thumbnail" 
          className={styles.ccThumbnailImage}
        />

        {/* 🔹 Educator Profile Below Thumbnail */}
        <Link to={`/educator/${course.creatorId}`} className={styles.ccEducatorLink}>
          <img 
            src={course.creatorPhoto || defaultProfile} 
            alt={`${course.creator}'s Profile`} 
            className={styles.ccEducatorPhoto}
          />
        </Link>
      </div>

      {/* Right Side - Course Details */}
      <div className={styles.ccInfo}>
        <h3 className={styles.ccCourseTitle}>{course.title}</h3>
        <p className={styles.ccCourseMeta}>
          <Link to={`/educator/${course.creatorId}`} className={styles.ccEducatorName}>
            {course.creator}
          </Link> 
          • {course.students} students • {course.category}
        </p>
        <p className={styles.ccCoursePrice}>${course.price.toFixed(2)}</p>
        <p className={styles.ccCourseRating}>⭐ {course.rating}</p>
      </div>
    </div>
  );
};

export default CourseCard;
