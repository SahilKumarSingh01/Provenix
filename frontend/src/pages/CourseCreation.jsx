import React, { useState } from "react";
import {useNavigate} from "react-router-dom"
import {toast} from 'react-toastify'
import axios from "../api/axios"; // Importing axios instance
import { useCache } from "../context/CacheContext.jsx";

import styles from "../styles/CourseCreation.module.css";

const CreateCourse = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const navigate = useNavigate();
    const {setCache}=useCache();
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post("api/course/create", {
                title,
                description,
                category
            });
            toast.success(response.data.message);
            const course=response.data.course;
            setCache(course._id,course);
            navigate(`/course/${response.data.course._id}/view`);

        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create course.");
        }
    };

    return (
        <div className={styles.createCourseContainer}>
            <div className={styles.leftPane}>
                <h2 className={styles.formHeading}>Create Course</h2>
                <form onSubmit={handleSubmit} className={styles.createCourseForm}>
                    <div className={styles.formGroup}>
                        <label>Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        ></textarea>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Category</label>
                        <input
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.buttonGroup}>
                        <button type="submit" className={styles.actionButton}>Create</button>
                    </div>
                </form>
            </div>
            <div className={styles.rightPane}>
                <h3>Provenix</h3>
                <p>Turn your knowledge into impact! Share your expertise with the world by creating an engaging course today.</p>
            </div>
        </div>

    );
};

export default CreateCourse;
