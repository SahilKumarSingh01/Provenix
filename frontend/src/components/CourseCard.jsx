import React from "react";
import { Link } from "react-router-dom"; // Import React Router Link

import styles from "../styles/CourseCard.module.css";
import defaultThumbnail from "../assets/DefaultThumbnail.png";
import defaultProfile from '../assets/defaultPicture.png';

const CourseCard = ({ course }) => {
  const renderRating = () => {
    if (course.numberOfRatings === 0) {
      return <span className={styles.ccRatingNumber}>Not Rated</span>;
    }
  
    const rating = Math.min(5, Math.max(0, course.totalRating / (course.numberOfRatings)));
    console.log("rating "+rating)
    const filled = "🟢".repeat(Math.floor(rating));
    const empty = "⚫".repeat(5 - Math.floor(rating));
  
    return (
      <div className={styles.ccRatingWrapper}>
        <span className={styles.ccRatingCircles}>{filled}{empty}</span>
        <span className={styles.ccRatingNumber}>({course.numberOfRatings})</span>
      </div>
    );
  };
  return (
    <Link to={`/course-view/${course._id}`} className={styles.ccLink}>
    <div className={styles.ccContainer}>
      <div className={styles.ccThumbnailWrapper}>
        <img
          src={course.thumbnail || defaultThumbnail}
          alt="Course Thumbnail"
          className={styles.ccThumbnailImage}
        />
      </div>

      <div className={styles.ccInfo}>
         {/* Profile + Title Wrapper */}
        <div className={styles.ccProfileWrapper}>
          <img
            src={course.creator.photo || defaultProfile}
            alt="Creator Profile"
            className={styles.ccProfileImage}
          />
          <div>
            <h3 className={styles.ccCourseTitle}>{course.title}</h3>
            <Link to={`/profile/${course.creator.username}`} className={styles.ccUsername}>
              @{course.creator.username}
            </Link>
          </div>
        </div>
        
        {/* Course Level & Status */}
        <div className={styles.ccLevelStatus}>
          <span className={styles.ccLevel}>{course.level}</span>
          <span className={styles.ccStatus}>{course.status}</span>
        </div>

        {/* Course Metadata */}
        <p className={styles.ccCourseMeta}>{course.totalEnrollment} students • {course.pageCount} pages • {course.videoCount} videos • {course.codeCount} codes</p>

        <div className={styles.ccPriceRatingWrapper}>
        <div className={styles.ccCourseRating}>{renderRating()}</div>
        <p className={styles.ccCoursePrice}>
          {course.price > 0 ? `$${course.price.toFixed(2)}` : "Free"}
        </p>
        
        </div>
      </div>
    </div>
    </Link>
  );
};

export default CourseCard;
