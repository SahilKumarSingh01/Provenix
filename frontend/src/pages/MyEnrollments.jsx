import { useEffect, useState } from "react";
import axios from "../api/axios";
import CourseCard from "../components/CourseCard";
import styles from "../styles/CourseListing.module.css";
import {toast} from 'react-toastify'
const MyCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState("updatedAt");
    const [order, setOrder] = useState(-1);
    const [hasNext, setHasNext] = useState(false);
    const [status, setStatus] = useState(""); 
    const [level, setLevel] = useState("");  
    const [skip, setSkip] = useState(0);  
    const limit = 3;  

    // Fetch fresh courses when filters or sorting change
    const fetchCourses = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get("/api/enrollment/enrolled-courses", {
                params: { sortBy, order, skip: 0, limit: limit + 1, status, level }
            });
            const fetchedCourses=data.enrollments.map((enrollment)=>{
                return {...enrollment.course,completedPages:enrollment.completedPages};
            })
            setCourses(fetchedCourses.slice(0, limit));
            setSkip(limit);
            setHasNext(fetchedCourses.length > limit);
        } catch (error) {
            console.log(error)
            toast.error(error.response.data?.message||"Error fetching enrollments");
        } finally {
            setLoading(false);
        }
    };

    // Load more courses on click
    const extendCourses = async () => {
        console.log('extend this is call');
        try {
            setLoading(true);
            const { data } = await axios.get("/api/course/created-courses", {
                params: { sortBy, order, skip, limit: limit + 1, status, level }
            });

            setCourses((prevCourses) => [...prevCourses, ...data.courses.slice(0, limit)]);
            setSkip(skip + limit);
            setHasNext(data.courses.length > limit);
        } catch (error) {
            toast.error("Error loading more courses:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch fresh courses when filters change
    useEffect(() => {
        fetchCourses();
    }, [sortBy, order, status, level]);

    return (
        <div className={styles.courseContainer}>
            <div className={styles.courseHeader}>
                <h2>My Enrollments</h2>
                <div className={styles.sortOptions}>
                    <label>Sort by: </label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="course.title">Title</option>
                        <option value="course.price">Price</option>
                        <option value="completedPagesSize">Progress</option>
                        <option value="createdAt">Date Created</option>
                    </select>
                    <button onClick={() => setOrder(order * -1)}>
                        {order === 1 ? "Ascending" : "Descending"}
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className={styles.filters}>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="expired">expired</option>
                </select>

                <select value={level} onChange={(e) => setLevel(e.target.value)}>
                    <option value="">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                </select>
            </div>

            {/* Course List */}
            {loading && courses.length === 0 ? (
                <p>Loading courses...</p>
            ) : (
                <div className={styles.courseList}>
                    {courses.length > 0 ? (
                        courses.map((course) => <CourseCard key={course._id} course={course} />)
                    ) : (
                        <p>No courses found.</p>
                    )}
                </div>
            )}

            {/* Load More Button */}
            <div className={styles.pagination}>
                {hasNext && (
                    <button onClick={extendCourses} disabled={loading}>
                        {loading ? "Loading..." : "Load More"}
                    </button>
                )}
            </div>
        </div>
    );
};

export default MyCourses;
