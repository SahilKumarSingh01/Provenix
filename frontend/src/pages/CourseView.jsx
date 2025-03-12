import React, { useState, useEffect } from "react";
import styles from "../styles/CourseView.module.css"; // Import CSS module

const CourseView = () => {
    const [course, setCourse] = useState(null);
    const defaultThumbnail =
        "https://res.cloudinary.com/dcn6jh9qs/image/upload/v1741167827/DefaultThumbnail_aaa4rm.png";

    useEffect(() => {
        const fetchCourseDetails = async () => {
            const data = {
                id: 1,
                name: "Course on Co-ordination Compounds for JEE 2022",
                instructor: "Akanksha",
                description:
                    "In this course, Akanksha will provide in-depth knowledge of Co-ordination Compounds...",
                category: "Chemistry",
                image: "",
                lessons: 29,
                practices: 0,
                startDate: "Apr 13, 2021",
                endDate: "Jun 12, 2021",
                isFree: true,
            };

            setCourse(data);
        };

        fetchCourseDetails();
    }, []);

    if (!course) {
        return <p className={styles.loading}>Loading course details...</p>;
    }

    return (
        <div className={styles.courseCard}>
            <div className={styles.courseImage}>
                <img src={course.image || defaultThumbnail} alt="Course" />
                <button className={styles.previewBtn}>PREVIEW</button>
            </div>

            <div className={styles.courseInfo}>
                <span className={styles.category}>{course.category.toUpperCase()}</span>
                <h2 className={styles.courseTitle}>{course.name}</h2>
                <p className={styles.instructor}>{course.instructor}</p>
                <p className={styles.description}>{course.description}</p>

                <div className={styles.courseStats}>
                    <span>📅 {course.startDate} - {course.endDate}</span>
                    <span>▶ {course.lessons} lessons</span>
                    <span>⚡ {course.practices} practices</span>
                </div>

                {course.isFree ? (
                    <button className={styles.studyBtn}>Study Panel</button>
                ) : (
                    <button className={styles.subscribeBtn}>Get Subscription</button>
                )}
            </div>
        </div>
    );
};

export default CourseView;
