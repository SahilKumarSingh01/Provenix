import React, { useState } from "react";
import "../styles/form.css"; 
import "../styles/CourseCreation.css"; 

const CreateCourse = () => {
    const [courseName, setCourseName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log({ courseName, description, category });
    };

    return (
        <div className="create-course-container">
            <div className="create-course-card">
                <h2>Create Course</h2>
                <form onSubmit={handleSubmit} className="create-course-form">

                    {/* Course Name */}
                    <label>Course Name:</label>
                    <input
                        type="text"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                        required
                    />

                    {/* Description */}
                    <label>Description:</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    ></textarea>

                    {/* Category Selection */}
                    <label>Category:</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                    >
                        <option value="">Select Category</option>
                        <option value="private">Private</option>
                        <option value="Free">Free</option>
                        <option value="Paid">Paid</option>
                    </select>

                    {/* Submit Button */}
                    <button type="submit">Create Course</button>
                </form>
            </div>
        </div>
    );
};

export default CreateCourse;
