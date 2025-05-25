import React, { useState ,useContext,useEffect} from "react";
import { useNavigate,useParams} from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {toast}  from 'react-toastify'
import axios from '../api/axios.js'
import ImageUploader from "../components/ImageUploader";
import styles from "../styles/CourseDetailForm.module.css";
import BackspaceButton from "../components/BackspaceButton.jsx"
import defaultThumbnail from '../assets/DefaultThumbnail.webp';
import ConfirmBox from "../components/ConfirmBox.jsx";
import { useCache } from "../context/CacheContext.jsx";
import {useCourse} from "../context/CourseContext"; // Import CourseContext

const CourseDetailForm = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { courseId } = useParams();
  const {getCache, setCache}=useCache();
  const {fetchCourse}=useCourse();
  const [course,setCourse]=useState();

  // Initialize state as empty/default values
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [accessType, setAccessType] = useState("free");
  const [price, setPrice] = useState(0);
  const [tags, setTags] = useState("");
  const [level, setLevel] = useState("");
  const [overlay, setOverlay] = useState(null);

  useEffect(() => {
    fetchCourse(courseId)
    .then((fetchedCourse)=>{
        if(fetchedCourse)
            setCourse(fetchedCourse);
        else navigate('/');
    }
    )
}, [courseId]);
  // Update state when course is available
  useEffect(() => {
    if (course) {
      setTitle(course.title || "");
      setCategory(course.category || "");
      setDescription(course.description || "");
      setThumbnail(course.thumbnail || "");
      setAccessType(course.price > 0 ? "paid" : "free");
      setPrice(course.price || 0);
      setTags(course.tags?.join(", ") || "");
      setLevel(course.level || "");
    }
  }, [course]); // Runs when `course` changes

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
        setCache(courseId,response.data.course);
        navigate(`/course/${course._id}/view`);
        toast.success(response.data.message);
    } catch (error) {
        toast.error(error.response?.data?.message || "Something went wrong!");
    }
  };

  const handlePublish=async()=>{
      const onConfirm=async()=>{
              try {
                const response = await axios.put(`api/course/${course._id}/publish`);
                toast.success(response.data.message);
                setCache(courseId,response.data.course);
                navigate(`/course/${course._id}/view`);
                setOverlay(null);
            } catch (error) {
              console.log(error);
                toast.error(error.response?.data?.message || "Something went wrong!");
            }
          }
      setOverlay((<ConfirmBox 
                onConfirm={onConfirm} 
                onCancel={()=>{setOverlay(null)}}
                message={`Are you sure you want to publish this course? Once published, 
                  it will be visible to others, and learners will be able to enroll. 
                  Please note that if someone enrolls, you will only be able to modify up to 30% of
                   the course content. Ensure everything is finalized before proceeding.`}
        />));
  }


    const handleDraft=async()=>{
      const onConfirm=async()=>{
              try {
                const response = await axios.put(`api/course/${course._id}/draft`);
                toast.success(response.data.message);
                setCache(courseId,response.data.course);
                setCourse(response.data.course);
                setOverlay(null);
            } catch (error) {
              console.log(error);
                toast.error(error.response?.data?.message || "Something went wrong!");
            }
          }
      setOverlay((<ConfirmBox 
                onConfirm={onConfirm} 
                onCancel={()=>{setOverlay(null)}}
                message={`Are you sure you want to move this course to draft?
                  You can only move it to draft if there are no active enrollments. 
                  Once in draft mode, the course will be hidden from learners, and
                   you can make changes freely. However, if the course had enrollments before,
                    you will only be able to modify up to 30% of the content.`}
        />));
    }


  const handleDelete=async()=>{
    const onConfirm=async()=>{
        try {
            const response = await axios.delete(`api/course/${course._id}`);
            toast.success(response.data.message);
            setCache(courseId,response.data.course);
            navigate(`/course/${course._id}/view`);
        } catch (error) {
          console.log(error);
            toast.error(error.response?.data?.message || "Something went wrong!");
        }
      }
    setOverlay((<ConfirmBox 
        onConfirm={onConfirm} 
        onCancel={()=>{setOverlay(null)}}
        message={`Are you sure you want to delete this course?
                  Once deleted, the course will be marked as deleted and will remain for 1 hour if
                 there are no active enrollments. If active enrollments exist, the course will remain 
                 until all enrollments expire. After deletion, the course cannot be purchased or renewed by anyone.
                   However, you may recover it within the available period if needed.`}
      />));
    }

  const setDefaultThumbnail=(e)=>{
    setThumbnail(null);
  }
  const handleUpload=(e)=>{
    setOverlay(<ImageUploader onCancel={()=>setOverlay(null)} onUpload={onUpload} aspect={4/3}/>);
  }

  const onUpload=async(image)=>{
    try{
      const formData = new FormData();
      formData.append("file", image);
      const{data}=await axios.post('api/upload/thumbnail',formData,{
      headers: {
        "content-type": "multipart/form-data",
      }});
      setThumbnail(data.url);
      setOverlay(null);
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
  
  if(!course || !user)
  {
    return (<p>loading...</p>)
  }

  return (
    <div className={styles.courseDetailContainer}>
      {overlay}
      <BackspaceButton to={`/course/${course._id}/view`}/>
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
            <div className={styles.thumbnailGroup}>
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
          {/* Delete Button in a separate div */}
          <div className={styles.deleteGroup}>
            <button type="button" className={styles.deleteBtn} onClick={handleDelete}>Delete</button>
          </div>

          {/* Update & Publish Buttons in another div */}
          <div className={styles.actionGroup}>
            <button type="submit" className={styles.actionButton}>Update</button>
            {course.status === "draft"?
                (<button type="button" className={styles.publishBtn} onClick={handlePublish}>Publish</button>)
              :
                (<button type="button" className={styles.publishBtn} onClick={handleDraft}>draft</button>)
            }
            
          </div>
        </div>

      </form>
    </div>
  );
};

export default CourseDetailForm;
