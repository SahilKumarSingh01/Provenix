import React, { useState, useEffect ,useContext} from "react";
import { AuthContext } from "../context/AuthContext";
import AvgRating from "./AvgRating";
import UserInfo from '../components/UserInfo'
import ReviewForm from '../components/ReviewForm';
import styles from "../styles/Reviews.module.css"; // Import CSS module
import axios  from '../api/axios';
import {toast} from 'react-toastify'
const Reviews = ({course}) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formOpen,setFormOpen]= useState(false);
    const [myReview,setMyReview]=useState('')
    const { user } = useContext(AuthContext);
    
    const canReview=1//course.canAccessContent&&user._id!=course.creator._id;
    useEffect(() => {
        const fetchReviews=async()=>{
            try{
                setLoading(true);
                // Fetch both reviews concurrently
                const [allReviewsResponse, myReviewResponse] = await Promise.all([
                    axios.get(`/api/course/${course._id}/review/all`),
                    axios.get(`/api/course/${course._id}/review/my-review`)
                ]);

                // Update state with fetched data
                setReviews(allReviewsResponse.data.reviews);
                setMyReview(myReviewResponse.data.review || null); // Handle no review cas
                
            }catch(error)
            {
                toast.error(error.response.data.message);
            }
            finally{
                setLoading(false);
            }
        }
        fetchReviews();
    }, []);
    const onReviewSubmit=async ({text,rating})=>{
        try{
            await axios.post(`/api/course/${course._id}/review/create`,{text,rating});
            toast.success('Review submitted successfully');
            setFormOpen(false);
        }catch(error)
        {
            toast.error(error.response.data.message);
        }
    }
    course.totalRating=60;
    course.numberOfRatings=13;
    return (
        <div className={styles.reviewsContainer}>
            <h2 className={styles.reviewsTitle}>Student Reviews</h2>
            <div className={styles.reviewHeader}>
                <div className={styles.ratingWrapper}>
                    Average Rating: <AvgRating course={course} />
                </div>
                <button
                className={styles.addReviewButton}
                onClick={() => setFormOpen(!formOpen)}
                disabled={!canReview}  // Disable if cannot review
                >
                Add Review
                </button>
            </div>
            {formOpen?<ReviewForm review={myReview} setFormOpen={setFormOpen} onSubmit={onReviewSubmit}/>:""}
            {loading ? (
                <p className={styles.loading}>Loading reviews...</p>
            ) : reviews.length>0?
                (reviews.map((review) => (
                    <div key={review.id} className={styles.reviewCard}>
                        <div className={styles.reviewHeader}>
                            <UserInfo user={review.user}/>
                            <span className={styles.reviewRating}>
                                {Array(review.rating).fill("★").join("")}
                            </span>
                        </div>
                        <p className={styles.reviewComment}>{review.text}</p>
                    </div>))):(<p className={styles.loading}>No reviews</p>)
            }
        </div>
    );
};

export default Reviews;
