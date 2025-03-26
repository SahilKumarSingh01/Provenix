import React from "react";
import { Link ,useNavigate} from "react-router-dom"; // Import React Router Link

import styles from "../styles/CourseCard.module.css";
import AvgRating from '../components/AvgRating'
import defaultThumbnail from "../assets/DefaultThumbnail.webp";
import defaultProfile from '../assets/defaultPicture.png';

const CourseCard = ({ course }) => {

  const navigate = useNavigate(); // Initialize navigate function
  const handleCardClick = () => {
    navigate(`/course-view/${course._id}`);
  };
  return (
    <div className={styles.ccContainer} onClick={handleCardClick}>
      {/* <Link to={`/course-view/${course._id}`} className={styles.ccLink}> */}
      <div className={styles.ccThumbnailWrapper}>
        <img
          src={course.thumbnail || defaultThumbnail}
          alt="Course Thumbnail"
          className={styles.ccThumbnailImage}
        />
      </div>
      {/* </Link> */}
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
            <Link to={`/profile/${course.creator.username}` } onClick={(e)=>e.stopPropagation()} className={styles.ccUsername}>
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
        <div className={styles.ccCourseRating}><AvgRating course={course}/></div>
        <p className={styles.ccCoursePrice}>
          {course.price > 0 ? `₹${course.price.toFixed(2)}` : "Free"}
        </p>
        
        </div>
      </div>
    </div>
   
  );
};

export default CourseCard;
