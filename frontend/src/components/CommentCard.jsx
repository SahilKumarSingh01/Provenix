import { useState, useContext, useRef, useEffect } from "react";
import styles from "../styles/CommentCard.module.css";
import UserInfo from "./UserInfo";
import { toast } from "react-toastify";
import axios from "../api/axios";
import MentionText from "../components/MentionText.jsx";
import { AuthContext } from "../context/AuthContext";
import CommentSection from "./CommentSection.jsx";

const CommentCard = ({ comment ,onReport,onRemove,onEdit,page}) => {
    const [openMenu, setOpenMenu] = useState(null);
    const menuRef = useRef(null);
    const { user } = useContext(AuthContext);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenu(null);
            }
        };

        if (openMenu === comment._id) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [openMenu, comment._id]);

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
                        <div className={styles.optionsMenu} ref={menuRef}>
                            <button onClick={onReport}>Report</button>
                            {user._id === comment.user._id && (
                                <>
                                <button onClick={onEdit}>Edit</button>
                                <button onClick={onRemove}>Remove</button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.commentText}>
                <MentionText text={comment.text} />
            </div>

            <p className={styles.commentDate}>
                {new Date(comment.createdAt).toLocaleString()}
            </p>
            {!comment.parentComment&&<CommentSection page={page} parentComment={comment}/>}
        </div>
    );
};

export default CommentCard;
