import React from "react";
import { Link ,useNavigate} from "react-router-dom"; // Import React Router Link

import styles from "../styles/CourseCard.module.css";
import AvgRating from '../components/AvgRating'
import defaultThumbnail from "../assets/DefaultThumbnail.webp";
import defaultProfile from '../assets/defaultPicture.png';

const CourseCard = ({ course }) => {

  const navigate = useNavigate(); // Initialize navigate function
  const handleCardClick = () => {
    navigate(`/course/${course._id}/view`);
  };
  const progess=course.completedPages?(course.completedPages.length/course.pageCount)*100:null;
  const expiresAt = course?.expiresAt ? new Date(course.expiresAt) : null;
  let daysLeft = null;
  
  if (expiresAt) {
    const today = new Date();
    const timeDiff = expiresAt - today;
    daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // convert ms to days
  }

  return (
    <div className={styles.ccContainer} onClick={handleCardClick}>
      <div className={styles.ccThumbnailWrapper}>
        <img
          src={course.thumbnail || defaultThumbnail}
          alt="Course Thumbnail"
          className={styles.ccThumbnailImage}
        />
      </div>

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

      <div className={styles.ccInfo}>
        <div className={styles.ccLevelStatus}>
          <span className={styles.ccLevel}>{course.level}</span>
          <span className={styles.ccStatus}>{course.status}</span>
        </div>

        <p className={styles.ccCourseMeta}>{course.totalEnrollment} students • {course.pageCount} pages • {course.videoCount} videos • {course.codeCount} code block</p>

        <div className={styles.ccCardFooter}>
          <div className={styles.ccRating}><AvgRating course={course}/></div>
          {daysLeft&&<span className={styles.ccDaysLeft}>{daysLeft} days left</span>}
          <span className={styles.ccPriceOrProgress}>
            {progess!==null?progess.toFixed(2)+"%":course.price > 0 ? `₹${course.price.toFixed(2)}` : "Free"}
          </span>  
          </div>
        </div>
    </div>
   
  );
};

export default CourseCard;
