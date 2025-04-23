import { useEffect, useState } from "react";
import axios from "../api/axios";
import CourseCard from "../components/CourseCard";
import styles from "../styles/CourseListing.module.css";
import { toast } from "react-toastify";

const SearchCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState("createdAt");
    const [order, setOrder] = useState(-1);
    const [hasNext, setHasNext] = useState(false);
    const [skip, setSkip] = useState(0);
    const limit = 9;

    // Filters
    const [keyword, setKeyword] = useState("");
    const [priceType,setPriceType]=useState("")
    const [category, setCategory] = useState("");
    const [tags, setTags] = useState("");
    const [level, setLevel] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const { data } = await axios.post("/api/course/search", {
                keyword,
                category,
                tags,
                level,
                minPrice,
                maxPrice,
                sortBy,
                order,
                skip: 0,
                limit: limit 
            });
            setCourses(data.courses);
            setSkip(limit);
            setHasNext(data.courses.length == limit);
        } catch (error) {
            console.log(error);
            toast.error("Error fetching search results.");
        } finally {
            setLoading(false);
        }
    };
    const extendCourses = async () => {
        try {
            setLoading(true);
            const { data } = await axios.post("/api/course/search", {
                keyword,
                category,
                tags,
                level,
                minPrice,
                maxPrice,
                sortBy,
                order,
                skip,
                limit: limit ,
            });
            setSkip(skip + limit);
            setCourses(prev => [...prev, ...data.courses]);
            
            setHasNext(data.courses.length == limit);
        } catch (error) {
            toast.error("Error loading more courses.");
        } finally {
            setLoading(false);
        }
    };
    const onReport=async(index)=>{
        const course=courses[index];
        if(!course)return;
        try {
            const {data} = await axios.put(`api/course/${course._id}/report`);
            toast.success(data.message);
            setCourses([...courses.filter((_, i) => i !== index)]);
        } catch (err) {
            console.log(err);
            toast.error(err.response?.data?.message || "Failed to report comment");
        }
    }
    console.log(courses);
    // Re-fetch when filters change
    useEffect(() => {
        fetchCourses();
    }, [sortBy,order,priceType,level]);

    return (
        <div className={styles.courseContainer}>
            <div className={styles.courseHeader}>
                <h2>Search Courses</h2>
                <div className={styles.sortOptions}>
                    <label>Sort by: </label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="avgRating">Avg. Rating</option>
                    <option value="totalEnrollment">Enrollments</option>
                    <option value="price">Course Price</option>
                    <option value="videoCount">Video Lessons</option>
                    <option value="codeCount">Code Exercises</option>
                    <option value="createdAt">Created On</option>
                    <option value="updatedAt">Last Updated</option>

                    </select>
                    <button onClick={() => setOrder(order * -1)}>
                        {order === 1 ? "Ascending" : "Descending"}
                    </button>
                </div>
                {/* Filters */}
                <div className={styles.filters}>
                    <input
                        type="text"
                        placeholder="Search by keyword..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Tags (comma separated)"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Min Price"
                        min="0"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Max Price"
                        min="0"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                    />
                    <select
                        value={priceType}
                        onChange={(e) => {
                            const selected = e.target.value;
                            setPriceType(selected);

                            if (selected === "Free") {
                                setMinPrice("0");
                                setMaxPrice("0");
                            } else if (selected === "Paid") {
                                setMinPrice("1");
                                setMaxPrice(""); // No upper bound
                            } else {
                                setMinPrice("");
                                setMaxPrice("");
                            }
                        }}
                    >
                        <option value="">All Types</option>
                        <option value="Free">Free</option>
                        <option value="Paid">Paid</option>
                    </select>
                    <select value={level} onChange={(e) => setLevel(e.target.value)}>
                        <option value="">All Levels</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>
                    <button className={styles.searchButton} onClick={fetchCourses}>
                        Search
                    </button>
                </div>
            </div>

            

            {/* Course List */}
            {loading && courses.length === 0 ? (
                <p>Loading courses...</p>
            ) : (
                <div className={styles.courseList}>
                    {courses.length > 0 ? (
                        courses.map((course,index) => (
                            <CourseCard key={course._id} course={course} onReport={()=>onReport(index)}/>
                        ))
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

export default SearchCourses;
