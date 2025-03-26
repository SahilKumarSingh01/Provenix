import { useState } from "react";
import styles from "../styles/ReviewCard.module.css"; // Assuming you have a CSS module for styling
import UserInfo from "./UserInfo"; // Importing the UserInfo component
import {toast} from 'react-toastify';
import axios from '../api/axios';
const ReviewCard = ({ review}) => {
    const [openMenu, setOpenMenu] = useState(null);
    const handleReport=async()=>{
        try{
            const {data}=await axios.post(`api/course/${review.courseId}/review/report/${review._id}`);
            toast.success(data.message);
        }catch(e){
            console.log(e);
            toast.error(e.response.data.message);
        }
    }
    return (
        <div key={review.id} className={styles.reviewCard}>
            <div className={styles.reviewHeader}>
                <UserInfo user={review.user} />
                <div className={styles.ratingActionWrapper}>
                    {/* Star Rating */}
                    <span className={styles.reviewRating}>
                        {Array(review.rating).fill("★").join("")}
                    </span>
                    
                    {/* Options Button */}
                    <div className={styles.reviewOptions}>
                        <button 
                            onClick={() => setOpenMenu(openMenu === review._id ? null : review._id)}
                            className={styles.optionsButton}
                        >
                            ⋮
                        </button>
                        
                        {/* Dropdown Menu */}
                        {openMenu === review._id && (
                            <div className={styles.optionsMenu}>
                                <button onClick={() => {handleReport();setOpenMenu(null)}}>Report</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Review Text */}
            <p className={styles.reviewText}>{review.text}</p>
        </div>
    );
};

export default ReviewCard;
