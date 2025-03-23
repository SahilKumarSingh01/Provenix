import { useEffect, useState } from "react";
import axios from "../api/axios";
import CourseCard from "../components/CourseCard";
import styles from "../styles/CourseListing.module.css";

const MyCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState("createdAt");
    const [order, setOrder] = useState(-1);
    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [status, setStatus] = useState(""); // draft or published
    const [price, setPrice] = useState(""); // free or paid
    const [level, setLevel] = useState(""); // Beginner, Intermediate, Advanced
    const limit = 9;

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get("/api/course/created-courses", {
                    params: { sortBy, order, page,skip: (page - 1) * limit, limit: limit + 1, status, price, level }
                });

                setCourses(data.courses.slice(0, limit));
                setHasNext(data.courses.length > limit);
            } catch (error) {
                console.error("Error fetching courses:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, [sortBy, order, page, status, price, level]);

    return (
        <div className={styles.courseContainer}>
            <div className={styles.courseHeader}>
                <h2>My Courses</h2>
                <div className={styles.sortOptions}>
                    <label>Sort by: </label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="createdAt">Date Created</option>
                        <option value="title">Title</option>
                        <option value="price">Price</option>
                    </select>
                    <button onClick={() => setOrder(order * -1)}>
                        {order === 1 ? "Ascending" : "Descending"}
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className={styles.filters}>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">All</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                </select>

                <select value={price} onChange={(e) => setPrice(e.target.value)}>
                    <option value="">All</option>
                    <option value="free">Free</option>
                    <option value="paid">Paid</option>
                </select>

                <select value={level} onChange={(e) => setLevel(e.target.value)}>
                    <option value="">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                </select>
            </div>

            {/* Course List */}
            {loading ? (
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

            {/* Pagination */}
            <div className={styles.pagination}>
                <button onClick={() => setPage(page - 1)} disabled={page === 1}>
                    Prev
                </button>
                <span>Page {page}</span>
                <button onClick={() => setPage(page + 1)} disabled={!hasNext}>
                    Next
                </button>
            </div>
        </div>
    );
};

export default MyCourses;
