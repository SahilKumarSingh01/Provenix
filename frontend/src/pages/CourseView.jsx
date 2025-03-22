import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import styles from "../styles/CourseView.module.css"; // Import CSS module
import defaultThumbnail from '../assets/DefaultThumbnail.png'
const CourseView = () => {
    const location = useLocation();
    const course = location.state?.course || {};

    return (
        <div className={styles.courseCard}>
            <div className={styles.courseImage}>
                <img src={course.image || defaultThumbnail} alt="Course" />
                <button className={styles.previewBtn}>PREVIEW</button>
            </div>

            <div className={styles.courseInfo}>
                <span className={styles.category}>
                    {course.category?.toUpperCase() || "UNKNOWN"}
                </span>
                <h2 className={styles.courseTitle}>{course.title || "Course Title"}</h2>
                <p className={styles.description}>
                    {course.description || "No description available."}
                </p>

                <div className={styles.courseStats}>
                    <span>📅 Created: {new Date(course.createdAt).toDateString()}</span>
                    <span>🎓 {course.totalEnrollment || 0} Enrolled</span>
                    <span>⭐ {course.totalRating || "No Ratings Yet"}</span>
                    <span>📚 {course.pageCount} Pages | 🎥 {course.videoCount} Videos</span>
                </div>

                {course.price === 0 ? (
                    <button className={styles.studyBtn}>Start Learning for Free</button>
                ) : (
                    <button className={styles.subscribeBtn}>Enroll Now - ${course.price}</button>
                )}

                {course.status === "draft" && (
                    <p className={styles.draftNotice}>This course is still in draft mode.</p>
                )}
            </div>
        </div>
    );
};


export default CourseView;
