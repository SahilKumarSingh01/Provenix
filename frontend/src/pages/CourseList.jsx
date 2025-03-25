import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/CourseList.module.css";

const course = {
  name: "Data Structures",
  options: ["Practice", "Test", "Notes", "Discussion"]
};

const CourseList = () => {
  const navigate = useNavigate(); // Navigation function

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className={styles.container}>
      {/* Course Title - Clickable */}
      <h1 
        className={styles.courseTitle} 
        onClick={() => handleNavigation(`/course/${course.name.toLowerCase()}`)}
      >
        {course.name}
      </h1>

      <div className={styles.optionsGrid}>
        {course.options.map((option, index) => (
          <div
            key={index}
            className={styles.optionCard}
            onClick={() => handleNavigation(`/course/${course.name.toLowerCase()}/${option.toLowerCase()}`)}
          >
            {option}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseList;
