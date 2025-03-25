import React from "react";
import { Link } from "react-router-dom";
import styles from "../styles/CourseCard.module.css";
import AvgRating from "../components/AvgRating";
import defaultThumbnail from "../assets/DefaultThumbnail.png";
import defaultProfile from "../assets/defaultPicture.png";

const CourseCard = ({ course }) => {
  course.totalRating = 60;
  course.numberOfRatings = 13;
  
  return (
    <div className={styles.ccContainer}>
      <Link to={`/course-view/${course._id}`} className={styles.ccLink}>
        <div className={styles.ccThumbnailWrapper}>
          <img
            src={course.thumbnail || defaultThumbnail}
            alt="Course Thumbnail"
            className={styles.ccThumbnailImage}
          />
          <Link to={`/educator/${course.creatorId}`} className={styles.ccEducatorLink}>
            <img 
              src={course.creatorPhoto || defaultProfile} 
              alt={`${course.creator}'s Profile`} 
              className={styles.ccEducatorPhoto}
            />
          </Link>
        </div>
      </Link>
      <div className={styles.ccInfo}>
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
        <div className={styles.ccLevelStatus}>
          <span className={styles.ccLevel}>{course.level}</span>
          <span className={styles.ccStatus}>{course.status}</span>
        </div>
        <p className={styles.ccCourseMeta}>
          {course.totalEnrollment} students • {course.pageCount} pages • {course.videoCount} videos • {course.codeCount} codes
        </p>
        <div className={styles.ccPriceRatingWrapper}>
          <div className={styles.ccCourseRating}><AvgRating course={course} /></div>
          <p className={styles.ccCoursePrice}>
            {course.price > 0 ? `$${course.price.toFixed(2)}` : "Free"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
