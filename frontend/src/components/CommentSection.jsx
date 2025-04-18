import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CommentForm from "./CommentForm.jsx";
import CommentCard from "./CommentCard.jsx";
import styles from "../styles/CommentSection.module.css";
import axios from "../api/axios";
import { toast } from "react-toastify";

const CommentSection = ({ page, parentComment = null }) => {
    const { pageCollectionId } = useParams();
    const [comments, setComments] = useState([]),
        [totalCount, setTotalCount] = useState(0),
        [loading, setLoading] = useState(true),
        [overlay, setOverlay] = useState(null),
        [skip, setSkip] = useState(0),
        [hasNext, setHasNext] = useState(false),
        [showComments, setShowComments] = useState(false);

    const limit = 2, isReply = !!parentComment;

    const fetchComments = async (reset = false) => {
        try {
            setLoading(true);
            const { data } = await axios.get(
                `/api/course/page/${pageCollectionId}/comment/${page._id}/all`,
                { params: { skip: reset ? 0 : skip, limit: limit + 1, parentComment: parentComment?._id } }
            );
            const fetched = data.comments.slice(0, limit);
            setComments(prev => reset ? fetched : [...prev, ...fetched]);
            setTotalCount(data.totalCount);
            setSkip(reset ? limit : skip + limit);
            setHasNext(data.comments.length > limit);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to fetch comments");
        } finally { setLoading(false); }
    };

    const handleAddComment = (index = -1) => {
        const isEdit = index !== -1;
        const initialText = isEdit ? comments[index].text : "";

        const onSubmit = async (text) => {
            try {
                const { data } = isEdit
                    ? await axios.put(`/api/course/page/${pageCollectionId}/comment/${page._id}/update/${comments[index]._id}`, { text })
                    : await axios.post(`/api/course/page/${pageCollectionId}/comment/${page._id}/create`, { text, parentComment: parentComment?._id || null });

                toast.success(data.message);
                setOverlay(null);
                if (isEdit) setComments([data.comment, ...comments.filter((_, i) => i !== index)]);
                else {
                    if(parentComment)parentComment.repliesCount++;
                    if(!isReply||showComments){
                         setComments([data.comment, ...comments]);
                         setTotalCount((count)=>count+1);
                    }
                }
            } catch (err) {
                console.log(err);
                toast.error(err.response?.data?.message || "Failed to add comment");
            }
        };

        setOverlay(<CommentForm initialText={initialText} onSubmit={onSubmit} onCancel={() => setOverlay(null)} />);
    };

    const handleEdit = i => handleAddComment(i);
    const handleReply = () => handleAddComment();
    const handleReport =async(index)=>{
        try {
            const { data } =await axios.post(`/api/course/page/${pageCollectionId}/comment/${page._id}/report/${comments[index]._id}`)
            toast.success(data.message);
            setComments([...comments.filter((_, i) => i !== index)]);
        } catch (err) {
            console.log(err);
            toast.error(err.response?.data?.message || "Failed to report comment");
        }
    }
    const handleRemove=async(index)=>{
        try {
            const { data } =await axios.delete(`/api/course/page/${pageCollectionId}/comment/${page._id}/remove/${comments[index]._id}`)
            toast.success(data.message);
            setComments([...comments.filter((_, i) => i !== index)]);
        } catch (err) {
            console.log(err);
            toast.error(err.response?.data?.message || "Failed to remove comment");
        }
    }
    const CommentContent = () => loading && !comments.length ? (
        <p className={styles.loading}>Loading comments...</p>
    ) : (
        <>
            <div className={styles.commentList}>
                {comments.length ? comments.map((comment, i) => (
                    <CommentCard key={comment._id} comment={comment} page={page} 
                        onEdit={() => handleEdit(i)} onRemove={()=>handleRemove(i)} onReport={() => handleReport(i)} />
                )) : <p className={styles.loading}>No comments found.</p>}
            </div>
            {hasNext && (
                <div className={styles.pagination}>
                    <button onClick={() => fetchComments()} disabled={loading} className={styles.actionButton}>
                        {loading ? "Loading..." : "Load More"}
                    </button>
                </div>
            )}
        </>
    );

    useEffect(() => { !isReply && fetchComments(true); }, [page, parentComment]);
    useEffect(() => { isReply && showComments && fetchComments(true); }, [showComments]);

    return (
        <div className={isReply ? styles.repliesContainer : styles.commentsContainer}>
            {overlay}
            {!isReply ? (
                <>
                    <h2 className={styles.commentsTitle}>Comments</h2>
                    <div className={styles.commentActionsWrapper}>
                        Comments({totalCount})
                        <button className={styles.actionButton} onClick={handleReply}>Add Comment</button>
                    </div>
                </>
            ) : (
                <div className={styles.replyHeader}>
                    <span className={styles.viewReplies} onClick={() => setShowComments(p => !p)}>
                        {showComments ? `Hide Replies (${parentComment.repliesCount})` : `View Replies (${parentComment.repliesCount})`}
                    </span>
                    <button className={styles.replyButton} onClick={handleReply}>Reply</button>
                </div>
            )}
            {!isReply ? CommentContent() : showComments && CommentContent()}
        </div>
    );
};

export default CommentSection;
