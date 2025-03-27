import React, { useContext, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {toast} from 'react-toastify'
import axios from '../api/axios.js';
import UserInfo from '../components/UserInfo';
import ReviewSection from '../components/ReviewSection';
import styles from "../styles/CourseView.module.css";
import defaultThumbnail from '../assets/DefaultThumbnail.webp';

const CourseView = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [course, setCourse] = useState(null);
    const [showReview,setShowReview]=useState(false);
    const [loading, setLoading] = useState(true);


    const fetchCourseDetails = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`/api/course/${courseId}`);
            setCourse(data.course);
        } catch (err) {
            toast.error(err?.response?.data?.message||"fail to load course");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
       
        fetchCourseDetails();
    }, [courseId]);
    if (loading) {
        return <div className={styles.loading}>Loading...</div>;
    }
    if(!course){
        navigate('/');
    }
    const handleRecovery=async()=>{
        try {
            const response = await axios.put(`api/course/${course._id}/recover`);
            toast.success(response.data.message);
            fetchCourseDetails();
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong!");
        }
    }
    return (
        <>
        <div className={styles.courseContainer}>
            {/* Left Panel - Thumbnail */}
            <div className={styles.leftPanel}>
                <img
                    src={course.thumbnail || defaultThumbnail}
                    alt="Course Thumbnail"
                    className={styles.thumbnail}
                />
            </div>

            {/* Right Panel - Course Details */}
            <div className={styles.rightPanel}>
                <h1 className={styles.title}>{course.title}</h1>
                <p className={styles.description}>{course.description}</p>

                {/* Course Stats */}
                <div className={styles.stats}>
                    <span>📚 {course.pageCount || 0} Pages</span>
                    <span>🎥 {course.videoCount || 0} Videos</span>
                    <span>🖥️ {course.codeCount || 0} Code Blocks</span>
                    <span>📑 {course.sections?.length || 0} Sections</span>
                    <span>🎓 {course.totalEnrollment || 0} Enrolled</span>
                </div>

                {/* Course Level */}
                {/* Course Meta - Category, Level, and Status */}
                <div className={styles.courseMeta}>
                    <span className={styles.category}> {course.category}</span>
                    <span className={styles.level}> {course.level}</span>
                    <span className={`${styles.status} ${styles[course.status.toLowerCase()]}`}> {course.status}</span>
                </div>


                {/* Course Dates */}
                <div className={styles.dates}>
                    <span>📅 Created: {course.createdAt ? new Date(course.createdAt).toDateString() : "N/A"}</span>
                    <span>📅 Updated: {course.updatedAt ? new Date(course.updatedAt).toDateString() : "N/A"}</span>
                </div>

                {/* Creator Info */}
                <span className={styles.creatorLabel}>Created by:</span>
                <div className={styles.creatorDetails}>
                    <UserInfo user={course.creator} />
                    <div className={styles.priceTag}>
                        {course.price ? `₹${course.price}` : "Free"}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className={styles.actions}>
                    {!course.canAccessContent ? (
                        <button className={styles.actionBtn} onClick={() => navigate(`/enroll/${course._id}`)}>
                            Enroll
                        </button>
                    ) : (
                        <button className={styles.actionBtn} onClick={() => navigate(`/sections/${course._id}`)}>
                            Sections
                        </button>
                    )}

                    {course.creator._id === user._id && 
                        course.status!=="deleted"?
                            (<button className={styles.actionBtn} onClick={() => navigate(`/course-detail-form`,{state:{course}})}>
                                Edit
                            </button>)
                        :(<button className={styles.actionBtn} onClick={handleRecovery}>
                            Recover
                        </button>)
                    }

                    <button className={styles.actionBtn} onClick={() => setShowReview(!showReview)}>
                        Reviews
                    </button>
                </div>


            </div>
        </div>
        {showReview?<ReviewSection course={course}/>:''}
        </>
    );
};

export default CourseView;
