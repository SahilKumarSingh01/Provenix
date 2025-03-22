import React, { useState } from "react";
import {useNavigate} from "react-router-dom"
import axios from "../api/axios"; // Importing axios instance
import styles from "../styles/CourseCreation.module.css";

const CreateCourse = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post("api/course/create", {
                title,
                description,
                category
            });
            alert("Course created successfully!");
            console.log(response.data.course);
            navigate("/course-view", { state: { course: response.data.course } });

        } catch (error) {
            console.error("Error creating course:", error.response?.data || error.message);
            alert(error.response?.data?.message || "Failed to create course.");
        }
    };

    return (
        <div className={styles.createCourseContainer}>
            <div className={styles.createCourseCard}>
                <h2>Create Course</h2>
                <form onSubmit={handleSubmit} className={styles.createCourseForm}>
                    <label>Title:</label>
                    <input
                        type="text"
                        value={title}
                        placeholder="Enter course title..."
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />

                    <label>Description:</label>
                    <textarea
                        value={description}
                        placeholder="Write a brief description..."
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    ></textarea>

                    <label>Category:</label>
                    <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="Specify course category..."
                        required
                    />

                    <button type="submit">Create Course</button>
                </form>
            </div>
        </div>
    );
};

export default CreateCourse;
