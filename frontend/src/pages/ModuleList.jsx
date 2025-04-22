import React, { useState ,useRef,useEffect } from "react";
import { useNavigate,useParams} from "react-router-dom";
import {useCourse} from "../context/CourseContext"; // Import CourseContext
import { toast } from "react-toastify";
import ConfirmBox from "../components/ConfirmBox.jsx";
import BackspaceButton from "../components/BackspaceButton.jsx"

import axios from '../api/axios.js';
import styles from "../styles/ModuleList.module.css";
import { useCache } from "../context/CacheContext.jsx";


const ModuleList = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const {fetchModuleCollection,fetchCourse} =useCourse();
  const {setCache}=useCache();
  const [course,setCourse]=useState();
  const [moduleCollection,setModuleCollection]=useState();
  const [modules,setModules]=useState();
  const [editing, setEditing] = useState(null);
  const [overlay,setOverlay]=useState(null);  
  const clickTimeoutRef = useRef(null);


  useEffect(()=>{
      const fetchAll=async()=>{
        const fetchedCourse=await fetchCourse(courseId);
        if(!fetchedCourse){
          navigate('/');
          return ;
        }
        const fetchedMC=await fetchModuleCollection(fetchedCourse.moduleCollection);
        if(!fetchedMC){
          navigate('/');
          return ;
        }
        setCourse(fetchedCourse);
        setModuleCollection(fetchedMC);
        setModules([...fetchedMC.modules]);//a seperate collection so any changes that left wouldn't affect it
      }
      fetchAll();
  },[courseId])


  const handleClick = (module, index) => {
    if (editing?.curIndex === index) {
      handleSaveEdit();
      return ;
    }
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    clickTimeoutRef.current = setTimeout(() => {
      navigate(`/course/${course._id}/module/${module.pageCollection}`);
    }, 250);
  };
  
  const handleDoubleClick = async(module,index) => {
    if (!course.isCreator) return;
    clearTimeout(clickTimeoutRef.current); // Clear the single click action
    if(editing)
      await handleSaveEdit();//saving previous changes
    const newediting={prevTitle:module.title,curTitle:module.title,prevIndex:index,curIndex:index,modules:[...modules]};
    setEditing(newediting);
  };

  const handleTitleChange=(e)=>{
    setEditing({...editing ,curTitle:e.target.value});
  }

  const handleSaveEdit = async() => {
    try{
        if(!editing)return ;
        let promises=[];
        const index=editing.curIndex;
        if(!editing.curTitle)
            return toast.warn('module title is required');
        if(editing.prevTitle!==editing.curTitle)
          promises.push(axios.put(`/api/course/module/${course.moduleCollection}/update`,{
            moduleId:editing.modules[index]._id,
            title:editing.curTitle,
          })
        )
        if(editing.prevIndex!==editing.curIndex)
          promises.push(axios.put(`/api/course/module/${course.moduleCollection}/reorder`,{
            oldIndex:editing.prevIndex,
            newIndex:editing.curIndex
          })
        )
        const results=await Promise.all(promises);
        results.forEach((result)=>toast.success(result.data.message));
        
        const updatedModules=[...editing.modules];
        updatedModules[index].title=editing.curTitle;
        setModules(updatedModules);
        setCache(moduleCollection._id,{...moduleCollection,modules:updatedModules});
        setEditing(null);
      }catch(e){
        console.log(e);
        toast.error(e.response?.data?.message||"failed to save changes");
    }
  };

  const handleRemoveModule = async() => {
    const onConfirm=async ()=>{
        try{
        const {data}=await axios.delete(`/api/course/module/${course.moduleCollection}/remove`,
            {params:{moduleId:editing.modules[editing.curIndex]._id,courseId:course._id}});
        const newModules=data.modules;
        const pageCount =data.pageCount;
        const videoCount=data.videoCount;
        const codeCount=data.codeCount;
        setCache(moduleCollection._id,{...moduleCollection,modules:newModules});
        setCache(course._id,{...course,pageCount,videoCount,codeCount});
        setModules(newModules);
        setEditing(null);
        toast.success(data.message);
      }catch(e){
        console.log(e);
          toast.error(e.response?.data?.message||"failed to remove module");
      }finally{
        onCancel();
      }
    }
    const onCancel=()=>{setOverlay(null)};
    const message=`Are you sure you want to delete this module? This action is irreversible.
                    All associated pages will be deleted, and their 
                    content will be permanently lost. Once deleted, it cannot be recovered.`;
    setOverlay(<ConfirmBox onConfirm={onConfirm} message={message} onCancel={onCancel}/>);
  };

  const handleShift = (direction) => {
    const curIndex =editing.curIndex;
    const newIndex = direction === "left" ? curIndex - 1 : curIndex + 1;
    if (newIndex < 0 || newIndex >= editing.modules.length) return;
    [editing.modules[curIndex], editing.modules[newIndex]] = [editing.modules[newIndex], editing.modules[curIndex]];
    // setModules(updatedmodules);
    setEditing({...editing,curIndex:newIndex});
  };

  const handleAddmodule = async() => {
    try{
      await handleSaveEdit();
      const {data}=await axios.post(`/api/course/module/${course.moduleCollection}/create`,{title:"Double click to edit"});
      const newModules=data.modules;
      setModules(newModules);
      setCache(moduleCollection._id,{...moduleCollection,modules:newModules});
      toast.success(data.message);
    }catch(e){
      console.log(e);
        toast.error(e.response?.data?.message||"Failed to add module");
    }
  };

  if(!modules)
  {
    return <p>Loading...</p>
  }
  const modulesToDisplay=editing==null?modules:editing.modules;

  return (
    <>
    {overlay}
    <BackspaceButton to={`/course/${course._id}/view`}/>
    <div className={styles.container}>
      <h1 className={styles.courseTitle} onClick={() => {console.log("navigate is trigger");navigate(`/course/${course._id}/view`)}}>
        {course.title}
      </h1>

      {editing !== null && (
        <div className={styles.editBox} >
          <input type="text" value={editing.curTitle} onChange={handleTitleChange}/>
          <button onClick={handleSaveEdit} className={styles.actionButton}>✔ Save</button>
          <button onClick={()=>setEditing(null)} className={styles.actionButton}>✗ cancel</button>
          <button onClick={handleRemoveModule} className={styles.removeButton}>✗ Remove</button>
          <button onClick={() => handleShift("left")} className={styles.shiftButton}>⬅ Left</button>
          <button onClick={() => handleShift("right")} className={styles.shiftButton}>➡ Right</button>
        </div>
      )}

      <div className={styles.optionsGrid}>
        {modulesToDisplay.map((module, index) => (
          <div
            key={index}
            className={`${styles.optionCard} ${editing?.curIndex === index ? styles.editingHighlight : ""}`}
            onClick={() => handleClick(module, index)}
            onDoubleClick={() => course.isCreator && handleDoubleClick(module,index)}
          >
            <p>{editing?.curIndex === index ? editing.curTitle :module.title}</p>
          </div>
        ))}

        {course.isCreator && (
          <div className={styles.addModuleCard} onClick={handleAddmodule}>
            ➕ Add module
          </div>
        )}
      </div>
    </div>
  </>
  );
};

export default ModuleList;
