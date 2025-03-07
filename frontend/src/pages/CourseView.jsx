import React, { useState } from "react";
import "../styles/CourseView.css"; // Dark theme CSS

const CourseView = () => {
    const [course] = useState({
        id: 1,
        name: "Course on Co-ordination Compounds for JEE 2022",
        instructor: "Piyush Maheshwari",
        description:
            "In this course, Piyush Maheshwari will provide in-depth knowledge of Co-ordination Compounds. The course will be helpful for aspirants preparing for IIT JEE Exam.",
        language: "Hindi",
        image: "", // Empty image to trigger default thumbnail
        lessons: 29,
        practices: 0,
        startDate: "Apr 13, 2021",
        endDate: "Jun 12, 2021",
    });

    const defaultThumbnail =
        "https://res.cloudinary.com/dcn6jh9qs/image/upload/v1741167827/DefaultThumbnail_aaa4rm.png";

    return (
        <div className="course-card">
            <div className="course-image">
                <img src={course.image || defaultThumbnail} alt="Course" />
                <button className="preview-btn">PREVIEW</button>
            </div>

            <div className="course-info">
                <span className="language">{course.language.toUpperCase()}</span>
                <h2 className="course-title">{course.name}</h2>
                <p className="instructor">{course.instructor}</p>
                <p className="description">{course.description}</p>

                <div className="course-stats">
                    <span className="date">📅 {course.startDate} - {course.endDate}</span>
                    <span className="lessons">▶ {course.lessons} lessons</span>
                    <span className="practices">⚡ {course.practices} practices</span>
                </div>

                <button className="subscribe-btn">Get Subscription</button>
            </div>
        </div>
    );
};

export default CourseView;
