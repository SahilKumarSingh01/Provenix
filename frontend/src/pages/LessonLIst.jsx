import React, { useState } from "react";
import styles from "../styles/ListSection.module.css";

const courseLessons = {
  name: "Data Structures",
  lessons: [
    "Introduction to Arrays",
    "Linked Lists",
    "Stacks & Queues",
    "Trees & Graphs",
    "Sorting Algorithms",
    "Dynamic Programming"
  ]
};

const ListSection = () => {
  const [completed, setCompleted] = useState(
    Array(courseLessons.lessons.length).fill(false)
  );

  const toggleLesson = (index) => {
    setCompleted((prev) => {
      const newCompleted = [...prev];
      newCompleted[index] = !newCompleted[index];
      return newCompleted;
    });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.courseTitle}>{courseLessons.name} - Lessons</h1>
      <ul className={styles.lessonList}>
        {courseLessons.lessons.map((lesson, index) => (
          <li key={index} className={styles.lessonItem}>
            <input
              type="checkbox"
              checked={completed[index]}
              onChange={() => toggleLesson(index)}
            />
            <span className={completed[index] ? styles.completed : ""}>
              {lesson}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListSection;
