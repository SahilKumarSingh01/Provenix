import React, {useState,useEffect,useRef} from "react";
import { Link, useNavigate } from "react-router-dom"; // Import React Router Link

import styles from "../styles/CourseCard.module.css";
import AvgRating from '../components/AvgRating';
import defaultThumbnail from "../assets/DefaultThumbnail.webp";
import defaultProfile from '../assets/defaultPicture.png';

const CourseCard = ({ course ,onDelete,onReEnroll}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate(); // Initialize navigate function
  const menuRef = useRef(); 

  const handleCardClick = () => {
    navigate(`/course/${course._id}/view`);
  };

  const progess = course.completedPages ? (course.completedPages.length / course.pageCount) * 100 : null;
  const expiresAt = course?.expiresAt ? new Date(course.expiresAt) : null;
  let daysLeft = null;
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const handleDropdownClick = (e) => {
    e.stopPropagation();  // Prevent card click
    setMenuOpen(!menuOpen);
  };
  if (expiresAt) {
    const today = new Date();
    const timeDiff = expiresAt - today;
    daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // convert ms to days
  }

  return (
    <div className={styles.container} onClick={handleCardClick}>
      <div className={styles.thumbnailWrapper}>
        <img
          src={course.thumbnail || defaultThumbnail}
          alt="Course Thumbnail"
          className={styles.thumbnailImage}
        />
        {course?.isEnrolled && (
          <div className={styles.dropdownWrapper} onClick={handleDropdownClick}>
            <button className={styles.dropdownToggle}>⋮</button>
            {menuOpen && (
              <div ref={menuRef} className={styles.dropdownMenu}>
                <button className={styles.dropdownItem} onClick={onDelete}>Delete Enrollment</button>
                <button className={styles.dropdownItem} onClick={onReEnroll}>Re-enroll</button>
              </div>
            )}
          </div>

        )}
      </div>

      <div className={styles.profileWrapper}>
        <img
          src={course.creator.photo || defaultProfile}
          alt="Creator Profile"
          className={styles.profileImage}
        />
        <div>
          <h3 className={styles.courseTitle}>{course.title}</h3>
          <Link to={`/profile/${course.creator.username}`} onClick={(e) => e.stopPropagation()} className={styles.username}>
            @{course.creator.username}
          </Link>
        </div>
      </div>

      <div className={styles.info}>
        <div className={styles.levelStatus}>
          <span className={styles.level}>{course.level}</span>
          <span className={styles.status}>{course.status}</span>
        </div>

        <p className={styles.courseMeta}>{course.totalEnrollment} students • {course.pageCount} pages • {course.videoCount} videos • {course.codeCount} code</p>

        <div className={styles.cardFooter}>
          <div className={styles.rating}><AvgRating course={course} /></div>
          {daysLeft && <span className={styles.daysLeft}>{daysLeft} days left</span>}
          <span className={styles.priceOrProgress}>
            {progess !== null ? progess.toFixed(2) + "%" : course.price > 0 ? `₹${course.price.toFixed(2)}` : "Free"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
