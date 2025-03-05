import React, { useState } from "react";
import "../styles/form.css"; 
import "../styles/CourseCreation.css"; 

const CreateCourse = () => {
    const [courseName, setCourseName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [thumbnail, setThumbnail] = useState(null);

    const defaultThumbnail = "/default-thumbnail.jpg"; // Default image path

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setThumbnail(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log({ courseName, description, category, thumbnail });
    };

    return (
        <div className="create-course-container">
            <div className="create-course-card">
                <h2>Create Course</h2>
                <form onSubmit={handleSubmit} className="create-course-form">
                    
                    {/* Thumbnail Upload */}
                    <label>Thumbnail:</label>
                    <div className="thumbnail-preview">
                        <img 
                            src={thumbnail || defaultThumbnail} 
                            alt="Thumbnail Preview" 
                            className="thumbnail-img"
                        />
                    </div>
                    <input type="file" accept="image/*" onChange={handleThumbnailChange} />

                    {/* Course Name */}
                    <label>Course Name:</label>
                    <input
                        type="text"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                    />

                    {/* Description */}
                    <label>Description:</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    ></textarea>

                    {/* Category Selection */}
                    <label>Category:</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
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
