import React, { useState ,useContext} from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {toast}  from 'react-toastify'
import axios from '../api/axios.js'
import ImageUploader from "../components/ImageUploader";
import styles from "../styles/CourseDetailForm.module.css";
import defaultThumbnail from '../assets/DefaultThumbnail.webp';

const CourseDetailForm = () => {
  const location = useLocation();
  const { course } = location.state;
  const { user } = useContext(AuthContext);
  
  // Separate state for each editable field
  const [title,setTitle]=useState(course.title);
  const [category,setCategory]=useState(course.category);
  const [description, setDescription] = useState(course.description);
  const [thumbnail, setThumbnail] = useState(course.thumbnail);
  const [openUploader,setOpenUploader]=useState(false);
  const [accessType, setAccessType] = useState(course.price > 0 ? "paid" : "free");
  const [price, setPrice] = useState(course.price);
  const [tags, setTags] = useState(course.tags.join(", "));
  const [level, setLevel] = useState(course.level);

  const handleSubmit = async(e) => {
    e.preventDefault();
    try {
        const updatedCourse = {
            title,
            category,
            description,
            thumbnail,
            price: accessType === "paid" ? Number(price) : 0,  // Set price to 0 for free courses
            tags: tags.split(",").map(tag => tag.trim()),  // Convert comma-separated string to array
            level
        };
        const response = await axios.put(`api/course/${course._id}`, updatedCourse);
        toast.success(response.data.message);
    } catch (error) {
        toast.error(error.response?.data?.message || "Something went wrong!");
    }
  };

  const handlePublish=async()=>{
      try {
          const response = await axios.put(`api/course/${course._id}/publish`);
          toast.success(response.data.message);
      } catch (error) {
          toast.error(error.response?.data?.message || "Something went wrong!");
      }
  }

  const setDefaultThumbnail=(e)=>{
    setThumbnail(null);
  }
  const handleUpload=(e)=>{
    setOpenUploader(true);
  }

  const onUpload=async(image)=>{
    try{
      const formData = new FormData();
      // console.log(image);
      formData.append("file", image);
      const{data}=await axios.post('api/upload/thumbnail',formData,{
      headers: {
        "content-type": "multipart/form-data",
      }});
      setThumbnail(data.url);
      toast.success("Image uploaded successfully");
    }catch(e){
      toast.error(e?.response?.data?.message||"Failed to upload image");
    }
  }

  const handleTypeChange=(e)=>{
      if(e.target.value=='paid'&&!(user.accountId)){
          toast.error("You don't have bank account link to provenix");
          return ;
      }
      return setAccessType(e.target.value);
  }

  return (
    <div className={styles.courseDetailContainer}>
      {openUploader?<ImageUploader setOpenUploader={setOpenUploader} onUpload={onUpload} aspect={4/3}/>:""}
      <h2 className={styles.formHeading}>Course Details</h2>
      <form onSubmit={handleSubmit} className={styles.courseForm}>
          <div className={styles.formGroup}>
            <label>Title:</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          
        <div className={styles.formGroup}>
          <label>Description:</label>
          <textarea value={description} id={styles.description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div className={styles.metaInfoWrapper}>
          <div className={styles.formGroup}>
              <label>Category:</label>
              <input type="text" value={category} onChange={(e) => setCategory(e.target.value)}  required/>
          </div>

          <div className={styles.formGroup}>
            <label>Level:</label>
            <select value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label>Type:</label>
            <select value={accessType} onChange={handleTypeChange}>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          {accessType === "paid" ? (
            <div className={styles.formGroup}>
              <label>Price (Rs.):</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} min="1" max="1000" required />
            </div>)
            :
            (<div className={styles.formGroup}>
              <label>Price (Rs.):</label>
              <input type="number" value={0} onChange={(e) => setPrice(e.target.value)} min="1" max="1000"  disabled={true}/>
            </div>)
          }

        </div>
        <div className={styles.formGroup}>
          <label>Thumbnail:</label>
            <div className={styles.thumbnailPreview}>
              <img src={thumbnail||defaultThumbnail} alt="Course Thumbnail" />
            </div>
            <div className={styles.thumbnailButtons}>
              <button type="button" onClick={setDefaultThumbnail} className={styles.actionButton}>Set Default</button>
              <button type="button" onClick={handleUpload} className={styles.actionButton}>Upload</button>
            </div>
        </div>



        <div className={styles.formGroup}>
          <label>Tags:</label>
          <textarea value={tags} onChange={(e) => setTags(e.target.value)}/>
        </div>
          <div className={styles.metaInfoWrapper}>
            <div className={styles.formGroup}>
              <label>Created At:</label>
              <input type="text" value={new Date(course.createdAt).toLocaleString()} readOnly />
            </div>

            <div className={styles.formGroup}>
              <label>Updated At:</label>
              <input type="text" value={new Date(course.updatedAt).toLocaleString()} readOnly />
            </div>
            <div className={styles.formGroup}>
              <label>Status:</label>
              <input type="text" value={course.status} readOnly />
            </div>
        </div>
        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.actionButton}>Update</button>
          <button type="button" className={styles.publishBtn} onClick={handlePublish} disabled={course.status=="published"}>Publish</button>
        </div>
      </form>
    </div>
  );
};

export default CourseDetailForm;
