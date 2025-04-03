import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {useCourse} from "../context/CourseContext"; // Import CourseContext
import ConfirmBox from "../components/confirmBox.jsx";
import axios from "../api/axios";
import styles from "../styles/PageList.module.css";
import { useCache } from "../context/CacheContext.jsx";
import SideBar from '../components/SideBar.jsx'
const PageList = () => {
  const { courseId, pageCollectionId } = useParams();
  const navigate = useNavigate();
  const { setCache}=useCache();
  const {fetchCourse,fetchPageCollection,fetchModuleCollection}=useCourse();
  const [course,setCourse]=useState();
  const [pageCollection,setPageCollection]=useState();
  const [pages, setPages] = useState([]);
  const [moduleTitle ,setModuleTitle]=useState('');
  const [progress, setProgress] = useState([]);
  const [editingPage, setEditingPage] = useState(null);
  const [overlay, setOverlay] = useState(null);
  const clickTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchAll=async()=>{
        const [fetchedCourse, fetchedPC] = await Promise.all([
            fetchCourse(courseId),
            fetchPageCollection(pageCollectionId)
        ]);
        
        const fetchedMC = await fetchModuleCollection(fetchedCourse.moduleCollection);
        const module = fetchedMC.modules.find(m => m.pageCollection === pageCollectionId);
    
        if(!fetchedCourse || !fetchedPC)
        {
          navigate('/');
          return;
        }
        setCourse(fetchedCourse);
        setPageCollection(fetchedPC);
        setModuleTitle(module.title);
        setPages(fetchedPC.pages);
      }
      fetchAll();
  }, [courseId, pageCollectionId]);

  const handleClick = (page, index) => {
    if (editingPage?.curIndex === index) {
      handleSaveEdit();
      return;
    }
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    clickTimeoutRef.current = setTimeout(() => {
      console.log(page);
      navigate(`/course/${courseId}/module/${pageCollectionId}/page/${page.contentSection}`);
    }, 250);
  };

  const handleDoubleClick = async (page, index) => {
    if (!course.isCreator) return;
    clearTimeout(clickTimeoutRef.current);
    if (editingPage) await handleSaveEdit();
    setEditingPage({ prevTitle: page.title, curTitle: page.title, prevIndex: index, curIndex: index });
  };

  const handleTitleChange = (e) => {
    setEditingPage({ ...editingPage, curTitle: e.target.value });
    const updatedPages = [...pages];
    updatedPages[editingPage.curIndex].title = e.target.value;
    setPages(updatedPages);
  };

  const handleSaveEdit = async () => {
    try {
      let promises = [];
      const oldIndex=editingPage.prevIndex;
      const newIndex=editingPage.curIndex;
      const title= editingPage.curTitle;
      const pageId=pages[oldIndex];
      if (!editingPage.curTitle) return toast.warn("Page title is required");
      if (editingPage.prevTitle !== editingPage.curTitle)
        promises.push(axios.put(`/api/course/page/${pageCollection._id}/update`,{title},{params:{pageId}}));
      if (editingPage.prevIndex !== editingPage.curIndex)
        promises.push(axios.put(`/api/course/page/${pageCollection._id}/reorder`,{oldIndex,newIndex}));
      const results = await Promise.all(promises);
      results.forEach((result) => toast.success(result.data.message));
      setCache(pageCollection._id,{...pageCollection,pages});
      setEditingPage(null);
    } catch (e) {
      console.log(e);
      toast.error(e.response?.data?.message || "Failed to save page changes");
    }
  };

  const handleRemovePage = async () => {
    const onConfirm = async () => {
      try {
        const pageId= pages[editingPage.curIndex]._id;
        const { data } = await axios.delete(`/api/course/page/${pageCollection._id}/remove`,
          {params:{courseId:course._id,pageId}}
        );
        const newPages=data.pages;
        const pageCount=data.pageCount;
        setCache(pageCollection._id,{...pageCollection,pages:newPages});
        setCache(course._id,{...course,pageCount});
        setPages(newPages);
        setEditingPage(null);
        toast.success(data.message);
      } catch (e) {
        toast.error(e.response?.data?.message || "Failed to remove page");
      } finally {
        onCancel();
      }
    };
    const onCancel = () => setOverlay(null);
    setOverlay(<ConfirmBox onConfirm={onConfirm} 
      message={`Warning! Deleting this page will permanently remove all its content,
         including text, images, videos, and any associated data. This action cannot be
         undone, and recovery will not be possible. Are you absolutely sure you want to proceed?`}
      onCancel={onCancel} />);
  };

  const handleShift = (direction) => {
    const curIndex = editingPage.curIndex;
    const newIndex = direction === "up" ? curIndex - 1 : curIndex + 1;
    if (newIndex < 0 || newIndex >= pages.length) return;
    const updatedPages = [...pages];
    [updatedPages[curIndex], updatedPages[newIndex]] = [updatedPages[newIndex], updatedPages[curIndex]];
    setPages(updatedPages);
    setEditingPage({ ...editingPage, curIndex: newIndex });
    
  };

  const handleAddPage = async () => {
    try {
      const { data } = await axios.post(`/api/course/page/${pageCollection._id}/create`, {
        title: "Double click to edit",
      });
      const newPages=data.pages;
      const pageCount=data.pageCount;
      setCache(pageCollection._id,{...pageCollection,pages:newPages});
      setCache(course._id,{...course,pageCount});
      setPages(newPages);
      toast.success(data.message);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to add page");
    }
  };
  if(!pageCollection)
  {
    return <p>Loading...</p>;
  }
  return (
    <>
      {overlay}
      <div className={styles.container}>
        <h1 className={styles.courseTitle} onClick={()=>navigate(`/course/${course._id}/view`)}>{course?.title} - {moduleTitle}</h1>
        {editingPage !== null && (
          <div className={styles.editBox}>
            <input type="text" value={editingPage.curTitle} onChange={handleTitleChange} />
            <button onClick={handleSaveEdit} className={styles.saveButton}>✔ Save</button>
            <button onClick={handleRemovePage} className={styles.removeButton}>❌ Remove</button>
            <button onClick={() => handleShift("up")} className={styles.shiftButton}>⬆ Up</button>
            <button onClick={() => handleShift("down")} className={styles.shiftButton}>⬇ Down</button>
          </div>
        )}
        <div className={styles.pagesGrid}>
          {pages.map((page, index) => (
            <div
              key={page._id}
              className={`${styles.pageCard} 
                          ${progress[index] ? styles.completed : ""} 
                          ${editingPage?.curIndex === index ? styles.selected : ""}`}
              onClick={() => handleClick(page, index)}
              onDoubleClick={() => course.isCreator && handleDoubleClick(page, index)}
            >
              <span>{index + 1}. {page.title}</span>
              {!course.isCreator?<input 
                type="checkbox" 
                checked={progress[index]} 
                onChange={() => toggleCompletion(index)} 
                onClick={(e) => e.stopPropagation()} 
              />:""}
            </div>
          ))}
          {course.isCreator && (
            <div className={styles.addPageCard} onClick={handleAddPage}>
              ➕ Add Page
            </div>
          )}
        </div>

      </div>
    </>
  );
};

export default PageList;
