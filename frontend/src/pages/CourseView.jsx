import React, {  useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {toast} from 'react-toastify'
import {useCourse} from "../context/CourseContext"; // Import CourseContext
import axios from '../api/axios.js';
import UserInfo from '../components/UserInfo';
import ReviewSection from '../components/ReviewSection';
import styles from "../styles/CourseView.module.css";
import defaultThumbnail from '../assets/DefaultThumbnail.webp';
import { useCache } from "../context/CacheContext.jsx";

const CourseView = () => {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const { setCache}=useCache();
    const {fetchCourse}=useCourse();
    const [course,setCourse]=useState();
    const [showReview,setShowReview]=useState(false);
    
    useEffect(() => {
        fetchCourse(courseId)
        .then((fetchedCourse)=>{
            if(fetchedCourse)
                setCourse(fetchedCourse);
            else navigate('/');
        }
        )
    }, [courseId]);
    
    if(!course){
        return <p>Loading....</p>
    }
    const handleRecovery=async()=>{
        try {
            const response = await axios.put(`api/course/${course._id}/recover`);
            toast.success(response.data.message);
            setCache(courseId,response.data.course);
            setCourse(response.data.course);
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Something went wrong!");
        }
    }
    const handleEnrollment=async()=>{
        try {
            const response = await axios.post(`api/enrollment/${course._id}/enroll`);
            toast.success(response.data.message);
            console.log(response.data)
            setCache(courseId,response.data.course);
            setCourse(response.data.course);
        } catch (error) {
            console.log(error);
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
                    <span>🎓 {course.totalEnrollment || 0} Enrolled</span>
                    <span>📝 {course.numberOfRatings || 0} Reviews </span>                    
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
                    {!course.isEnrolled&&!course.isCreator ? (
                        <button className={styles.actionBtn} onClick={handleEnrollment}>
                            Enroll
                        </button>
                    ) : ""}

                    <button className={styles.actionBtn} onClick={() => navigate(`/course/${course._id}/modules`)}>
                        Modules
                    </button>

                    {course.isCreator ?
                        course.status!=="deleted"?
                            (<button className={styles.actionBtn} onClick={() => navigate(`/course/${course._id}/detail-form`,{state:{course}})}>
                                Edit
                            </button>)
                        :(<button className={styles.actionBtn} onClick={handleRecovery}>
                            Recover
                        </button>)
                        :""
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
