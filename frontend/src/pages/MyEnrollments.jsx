import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import axios from "../api/axios";
import CourseCard from "../components/CourseCard";
import ConfirmBox from "../components/ConfirmBox.jsx";

import styles from "../styles/CourseListing.module.css";
import {toast} from 'react-toastify'
import { useCache } from "../context/CacheContext.jsx";

const MyEnrollments = () => {
    const { setCache}=useCache();
    const navigate=useNavigate();
    const [overlay, setOverlay] = useState(null);
    
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState("updatedAt");
    const [order, setOrder] = useState(-1);
    const [hasNext, setHasNext] = useState(false);
    const [status, setStatus] = useState(""); 
    const [level, setLevel] = useState("");  
    const [skip, setSkip] = useState(0);  
    const limit = 9;  

    // Fetch fresh courses when filters or sorting change
    const fetchCourses = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get("/api/enrollment/enrolled-courses", {
                params: { sortBy, order, skip: 0, limit: limit + 1, status, level }
            });
            const fetchedCourses=data.enrollments.map((enrollment)=>{
                return {...enrollment,...enrollment.course,enrollmentId:enrollment._id,isEnrolled:true};
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
        try {
            setLoading(true);
            const { data } = await axios.get("/api/enrollment/enrolled-courses", {
                params: { sortBy, order, skip, limit: limit + 1, status, level }
            });
            const fetchedCourses=data.enrollments.map((enrollment)=>{
                return {...enrollment,...enrollment.course,enrollmentId:enrollment._id,isEnrolled:true};
            })
            setCourses([...courses,...fetchedCourses.slice(0, limit)]);
            setSkip(skip + limit);
            setHasNext(fetchedCourses.length > limit);
        } catch (error) {
            console.log(error);
            toast.error("Error loading more courses");
        } finally {
            setLoading(false);
        }
    };
    const handleDelete=(index)=>{
        const onConfirm=async()=>{
            try {
                const enrollmentId=courses[index].enrollmentId;
                const {data} = await axios.delete(`api/enrollment/${enrollmentId}`);
                toast.success(data.message);
                const updatedCourses=[...courses];
                updatedCourses.splice(index, 1);
                setCourses(updatedCourses);
                setOverlay(null);
            } catch (error) {
                console.log(error);
                toast.error(error.response?.data?.message || "Something went wrong!");
            }
        }
        setOverlay(<ConfirmBox 
            onConfirm={onConfirm} 
            onCancel={() => { setOverlay(null) }}
            message={`Are you sure you want to remove your enrollment from this course? 
                      Doing so will completely remove your enrollment, including any insights, history, 
                      and progress you’ve made in the course. 
                      Please note that if you’ve purchased the course, the payment will not be refunded, 
                      and you will lose access to the content once removed, even if the course has not yet expired.`}
        />);
        
    }
    const handleReEnroll=async(index)=>{
        try {
            const courseId=courses[index]._id;
            const {data} = await axios.post(`api/enrollment/${courseId}/enroll`);
            toast.success(data.message);
            if(data.order){
                console.log(data.order);
                navigate(`/razorpay-order?orderId=${data.order.id}&courseId=${courseId}&enrollmentId=${data.enrollment._id}`,
                    {state:{course:courses[index],order:data.order}});
            }
            setCache(courseId,data.course);
            const updatedCourses=[...courses];
            updatedCourses[index]={...data.enrollment,...data.course,enrollmentId:data.enrollment._id,isEnrolled:true};
            setCourses(updatedCourses);
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Something went wrong!");
        }
    }
    // Fetch fresh courses when filters change
    useEffect(() => {
        fetchCourses();
    }, [sortBy, order, status, level]);

    return (
        <div className={styles.courseContainer}>
            {overlay}
            <div className={styles.courseHeader}>
                <h2>My Enrollments</h2>
                <div className={styles.sortOptions}>
                    <label>Sort by: </label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="expiresAt">Expiry Time</option>
                        <option value="course.title">Course Title</option>
                        <option value="course.price">Course Price</option>
                        <option value="course.videoCount">Total Videos</option>
                        <option value="course.codeCount">Total Codes</option>
                        <option value="completedPagesSize">Your Progress</option>
                        <option value="expiresAt">Expiry Time</option>
                        <option value="createdAt">Created Date</option>
                    </select>
                    <button onClick={() => setOrder(order * -1)}>
                        {order === 1 ? "Ascending" : "Descending"}
                    </button>
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
            </div>

           

            {/* Course List */}
            {loading && courses.length === 0 ? (
                <p>Loading courses...</p>
            ) : (
                <div className={styles.courseList}>
                    {courses.length > 0 ? (
                        courses.map((course,index) => <CourseCard key={course._id} course={course} 
                            onDelete={()=>handleDelete(index)} onReEnroll={()=>handleReEnroll(index)}/>)
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

export default MyEnrollments;
