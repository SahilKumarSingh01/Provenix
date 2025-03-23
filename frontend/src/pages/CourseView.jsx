import React, { useContext ,useState,useEffect} from "react";
import { useParams,useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // Import Auth Context
import axios from '../api/axios.js'
import styles from "../styles/CourseView.module.css";
import defaultThumbnail from '../assets/DefaultThumbnail.png';

const CourseView = () => {
    const {courseId}=useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext); // Get authenticated user
    const [course,setCourse] = useState({});
    useEffect(() => {
        const fetchCourseDetails = async () => {
            try {
                // setLoading(true);
                const { data } = await axios.get(`/api/course/${courseId}`);
                console.log(data);
                setCourse(data);
            } catch (err) {
                // setError("Failed to fetch course details");
                // console.error("Error fetching course:", err);
            } finally {
                // setLoading(false);
            }
        };

        fetchCourseDetails();
    }, [courseId]);
    // Check if the logged-in user is the creator of the course
    const isCreator = user?._id === course.creator;

    // Check if user can access content
    const canAccessContent = course.status !== "draft" && (isCreator || course.price === 0);

    // Calculate average rating (handle division by zero)
    const avgRating = course.numberOfRatings > 0 
        ? (course.totalRating / course.numberOfRatings).toFixed(1) 
        : "No Ratings Yet";

    return (
        <div className={styles.courseCard}>
            <div className={styles.courseImage}>
                <img src={course.image || defaultThumbnail} alt="Course" />
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
                    <span>⭐ {avgRating} ({course.numberOfRatings} Ratings)</span>
                    <span>📚 {course.pageCount} Pages</span>
                    <span>🎥 {course.videoCount || 0} Videos</span>
                    <span>📑 {course.sections?.length || 0} Sections</span>
                    <span>🖥️ {course.codeCount || 0} Code Blocks</span>
                </div>

                {/* Show "Edit" and "Sections" only if the user is the creator */}
                {isCreator ? (
                    <div className={styles.creatorOptions}>
                        <button onClick={() => navigate("/course-edit", { state: { course } })} className={styles.secondaryBtn}>
                            Edit Course
                        </button>
                        <button onClick={() => navigate("/course-sections", { state: { course } })} className={styles.secondaryBtn}>
                            Manage Sections
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Show "Sections" if user can access content, otherwise show "Enroll" */}
                        {canAccessContent ? (
                            <button onClick={() => navigate("/course-sections", { state: { course } })} className={styles.secondaryBtn}>
                                View Sections
                            </button>
                        ) : (
                            <button className={styles.primaryBtn}>
                                Enroll Now {course.price > 0 && `- $${course.price}`}
                            </button>
                        )}
                    </>
                )}

                {course.status === "draft" && (
                    <p className={styles.draftNotice}>This course is still in draft mode.</p>
                )}
            </div>
        </div>
    );
};

export default CourseView;
