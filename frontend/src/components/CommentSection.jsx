import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import CommentForm from "./CommentForm.jsx";
import CommentCard from "./CommentCard.jsx";
import styles from "../styles/CommentSection.module.css";
import axios from "../api/axios";
import { toast } from "react-toastify";

const CommentSection = ({ page }) => {
    const { pageCollectionId} = useParams();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [overlay,setOverlay]=useState(null);
    const [skip, setSkip] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const limit = 2;

    const fetchComments = async (reset = false) => {
        try {
            setLoading(true);
            const { data } = await axios.get(`/api/course/page/${pageCollectionId}/comment/${page._id}/all`, {
                params: { skip: reset ? 0 : skip, limit: limit + 1 },
            });
            console.log(data);
            setComments((prev) =>
                reset ? data.comments.slice(0, limit) : [...prev, ...data.comments.slice(0, limit)]
            );
            setSkip(reset ? limit : skip + limit);
            setHasNext(data.comments.length > limit);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch comments");
        } finally {
            setLoading(false);
        }
    };
    const handleAddComment=(index=-1,reply=false)=>{
        const initialText=index!==-1?comments[index].text:"";
        const onSubmit=async(text)=>{
            try{
                const { data } = await axios.post(`/api/course/page/${pageCollectionId}/comment/${page._id}/create`,
                     {text,parentComment:reply?comments[index]._id:null});
                toast.success(data.message);
                setOverlay(false);
                setComments([data.comment,comments]);
            }catch (error) {
                console.log(error);
                toast.error(error.response?.data?.message || "Failed to fetch comments");
            } 
        }
        const onCancel=()=>{setOverlay(null)};
        setOverlay(<CommentForm initialText={initialText} onSubmit={onSubmit} onCancel={onCancel}/>)
    }

    useEffect(() => {
        fetchComments(true);
    }, [page]);

    return (
        <div className={styles.commentsContainer}>
            {overlay}
            <h2 className={styles.commentsTitle}>Comments</h2>
            <div className={styles.commentActionsWrapper}>
                Comments({page.commentCount})
                <button className={styles.addCommentButton} onClick={() => handleAddComment()}>
                    Add Comment
                </button>
            </div>

            {/* Comment List */}
            {loading && comments.length === 0 ? (
                <p className={styles.loading}>Loading comments...</p>
            ) : (
                <div className={styles.commentList}>
                    {comments.length > 0
                        ? comments.map((comment) => <CommentCard key={comment._id} comment={comment} />)
                        : <p className={styles.loading}>No comments found.</p>}
                </div>
            )}

            {/* Load More */}
            {hasNext && (
                <div className={styles.pagination}>
                    <button onClick={() => fetchComments()} disabled={loading} className={styles.loadMoreButton}>
                        {loading ? "Loading..." : "Load More"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default CommentSection;
