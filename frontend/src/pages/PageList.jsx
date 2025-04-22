import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {useCourse} from "../context/CourseContext"; // Import CourseContext
import ConfirmBox from "../components/ConfirmBox.jsx";
import BackspaceButton from "../components/BackspaceButton.jsx"

import axios from "../api/axios";
import styles from "../styles/PageList.module.css";
import { useCache } from "../context/CacheContext.jsx";
const PageList = () => {
  const { courseId, pageCollectionId } = useParams();
  const navigate = useNavigate();
  const { setCache}=useCache();
  const {fetchCourse,fetchPageCollection,fetchModuleCollection}=useCourse();
  const [course,setCourse]=useState();
  const [pageCollection,setPageCollection]=useState();
  const [pages, setPages] = useState([]);
  const [moduleTitle ,setModuleTitle]=useState('');
  const [completedPages, setCompletedPages] = useState([]);
  const [editing, setEditing] = useState(null);
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
        setPages([...fetchedPC.pages]);//same as module list
        if(fetchedCourse.isEnrolled)
        {
          try{
            const {data}=await axios.get('/api/enrollment/completed-pages',{params:{courseId:fetchedCourse._id}});
            const completedPageIds = new Set(data.completedPages); // for faster lookup
            const updatedCompletionStatus = fetchedPC.pages.map(page => 
              completedPageIds.has(page._id)
            );
            setCompletedPages(updatedCompletionStatus);
          }
          catch(e)
          {
            console.log("error form page view",e);
          }
        }
      }
      fetchAll();
  }, [courseId, pageCollectionId]);

  const handleClick = (page, index) => {
    if (editing?.curIndex === index) {
      handleSaveEdit();
      return;
    }
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    clickTimeoutRef.current = setTimeout(() => {
      navigate(`/course/${courseId}/module/${pageCollectionId}/page/${page.contentSection}`);
    }, 250);
  };


  const toggleCompletion=(index)=>{
    const updatedPages=[...completedPages];
    updatedPages[index]=!updatedPages[index];
    setCompletedPages(updatedPages);
    const updateRemote=async()=>{
      try{
        const {data}=await axios.patch(`/api/enrollment/progress/${completedPages[index]?'pull':'push'}`,
          {pageId:pages[index]._id},
          {params:{courseId:course._id}});
        toast.success(data.message);
      }catch(e){
        toast.error(e.response.data?.message||"fail to update remotely");
        const rollback=[...updatedPages];
        rollback[index]=!rollback[index];
        setCompletedPages(rollback);
      }   
    }
    updateRemote();
  }

  const handleDoubleClick = async (page, index) => {
    if (!course.isCreator) return;
    clearTimeout(clickTimeoutRef.current);
    if (editing) await handleSaveEdit();
    setEditing({ prevTitle: page.title, curTitle: page.title, prevIndex: index, curIndex: index ,pages:[...pages]});
  };

  const handleTitleChange = (e) => {
    setEditing({ ...editing, curTitle: e.target.value });
  };

  const handleSaveEdit = async () => {
    try {
      if(!editing)return ;
      let promises = [];
      const oldIndex=editing.prevIndex;
      const newIndex=editing.curIndex;
      const title= editing.curTitle;
      const pageId=editing.pages[newIndex]._id;
      if (!editing.curTitle) return toast.warn("Page title is required");
      if (editing.prevTitle !== editing.curTitle)
        promises.push(axios.put(`/api/course/page/${pageCollection._id}/update`,{title},{params:{pageId}}));
      if (editing.prevIndex !== editing.curIndex)
        promises.push(axios.put(`/api/course/page/${pageCollection._id}/reorder`,{oldIndex,newIndex}));
      const results = await Promise.all(promises);
      results.forEach((result) => {toast.success(result.data.message);});
      const updatedPages=[...editing.pages];
      updatedPages[newIndex].title=editing.curTitle;
      setPages(updatedPages);
      setCache(pageCollection._id,{...pageCollection,pages:editing.pages});
      setEditing(null);
    } catch (e) {
      console.log(e);
      toast.error(e.response?.data?.message || "Failed to save page changes");
    }
  };

  const handleRemovePage = async () => {
    const onConfirm = async () => {
      try {
        const pageId= editing.pages[editing.curIndex]._id;
        const { data } = await axios.delete(`/api/course/page/${pageCollection._id}/remove`,
          {params:{courseId:course._id,pageId}}
        );
        const newPages=data.pages;
        const pageCount=data.pageCount;
        const codeCount=data.codeCount;
        const videoCount=data.videoCount;
        setCache(pageCollection._id,{...pageCollection,pages:newPages});
        setCache(course._id,{...course,pageCount,codeCount,videoCount});
        setPages(newPages);
        setEditing(null);
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
    const curIndex = editing.curIndex;
    const newIndex = direction === "up" ? curIndex - 1 : curIndex + 1;
    if (newIndex < 0 || newIndex >= editing.pages.length) return;
    [editing.pages[curIndex], editing.pages[newIndex]] = [editing.pages[newIndex], editing.pages[curIndex]];
    setEditing({ ...editing, curIndex: newIndex});
  };

  const handleAddPage = async () => {
    try {
      await handleSaveEdit();
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
  const pagesToDisplay=editing==null?pages:editing.pages;
  return (
    <>
      {overlay}
      <BackspaceButton to={`/course/${course._id}/modules`}/>

      <div className={styles.container}>
        <h1 className={styles.courseTitle} onClick={()=>navigate(`/course/${course._id}/view`)}>{course?.title} - {moduleTitle}</h1>
        {editing !== null && (
          <div className={styles.editBox}>
            <input type="text" value={editing.curTitle} onChange={handleTitleChange} />
            <button onClick={handleSaveEdit} className={styles.actionButton}>✔ Save</button>
            <button onClick={()=>setEditing(null)} className={styles.actionButton}>✗ cancel</button>
            <button onClick={handleRemovePage} className={styles.removeButton}>✗ Remove</button>
            <button onClick={() => handleShift("up")} className={styles.shiftButton}>⬆ Up</button>
            <button onClick={() => handleShift("down")} className={styles.shiftButton}>⬇ Down</button>
          </div>
        )}
        <div className={styles.pagesGrid}>
          {pagesToDisplay.map((page, index) => (
            <div
              key={page._id}
              className={`${styles.pageCard} 
                          ${completedPages[index] ? styles.completed : ""} 
                          ${editing?.curIndex === index ? styles.selected : ""}`}
              onClick={() => handleClick(page, index)}
              onDoubleClick={() => course.isCreator && handleDoubleClick(page, index)}
            >
              <span>{index + 1}. {editing?.curIndex === index ? editing.curTitle: page.title}</span>
              {!course.isCreator?<input 
                type="checkbox" 
                checked={completedPages[index]!==true?false:true} 
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
