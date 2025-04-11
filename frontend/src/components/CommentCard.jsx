import { useState } from "react";
import styles from "../styles/CommentCard.module.css"; // Make sure you create this module
import UserInfo from "./UserInfo";
import { toast } from "react-toastify";
import axios from "../api/axios";

const CommentCard = ({ comment }) => {
    const [openMenu, setOpenMenu] = useState(null);

    const handleReport = async () => {
        try {
            const { data } = await axios.post(`/api/comment/report/${comment._id}`);
            toast.success(data.message);
        } catch (e) {
            console.error(e);
            toast.error(e?.response?.data?.message || "Something went wrong!");
        }
    };

    return (
        <div key={comment._id} className={styles.commentCard}>
            <div className={styles.commentHeader}>
                <UserInfo user={comment.user} />
                <div className={styles.commentActions}>
                    <button
                        onClick={() => setOpenMenu(openMenu === comment._id ? null : comment._id)}
                        className={styles.optionsButton}
                    >
                        ⋮
                    </button>

                    {openMenu === comment._id && (
                        <div className={styles.optionsMenu}>
                            <button onClick={() => { handleReport(); setOpenMenu(null); }}>
                                Report
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <p className={styles.commentText}>{comment.text}</p>
            <p className={styles.commentDate}>
                {new Date(comment.createdAt).toLocaleString()}
            </p>
        </div>
    );
};

export default CommentCard;
