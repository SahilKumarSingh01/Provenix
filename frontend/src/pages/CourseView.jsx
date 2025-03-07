import React, { useState, useEffect } from "react";
import "../styles/CourseView.css"; // Dark theme CSS

const CourseView = () => {
    const [course, setCourse] = useState(null);
    const defaultThumbnail =
        "https://res.cloudinary.com/dcn6jh9qs/image/upload/v1741167827/DefaultThumbnail_aaa4rm.png";

    // Simulating API call to fetch course details
    useEffect(() => {
        const fetchCourseDetails = async () => {
            // Simulated API response
            const data = {
                id: 1,
                name: "Course on Co-ordination Compounds for JEE 2022",
                instructor: "Akanksha",
                description:
                    "In this course, Akanksha will provide in-depth knowledge of Co-ordination Compounds...",
                category: "Chemistry",
                image: "", // If empty, show default thumbnail
                lessons: 29,
                practices: 0,
                startDate: "Apr 13, 2021",
                endDate: "Jun 12, 2021",
                isFree: true, // 🟢 Dynamic value (changes per course)
            };

            setCourse(data);
        };

        fetchCourseDetails();
    }, []);

    // Show loading state while fetching course details
    if (!course) {
        return <p className="loading">Loading course details...</p>;
    }

    return (
        <div className="course-card">
            <div className="course-image">
                <img src={course.image || defaultThumbnail} alt="Course" />
                <button className="preview-btn">PREVIEW</button>
            </div>

            <div className="course-info">
                <span className="category">{course.category.toUpperCase()}</span>
                <h2 className="course-title">{course.name}</h2>
                <p className="instructor">{course.instructor}</p>
                <p className="description">{course.description}</p>

                <div className="course-stats">
                    <span className="date">📅 {course.startDate} - {course.endDate}</span>
                    <span className="lessons">▶ {course.lessons} lessons</span>
                    <span className="practices">⚡ {course.practices} practices</span>
                </div>

                {/* 🔥 Dynamic Button: Study Panel if free, Subscription if paid */}
                {course.isFree ? (
                    <button className="study-btn">Study Panel</button>
                ) : (
                    <button className="subscribe-btn">Get Subscription</button>
                )}
            </div>
        </div>
    );
};

export default CourseView;
