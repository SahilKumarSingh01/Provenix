import React, { useState ,useRef,useEffect } from "react";
import { useNavigate,useParams} from "react-router-dom";
import {useCourse} from "../context/CourseContext"; // Import CourseContext
import { toast } from "react-toastify";
import ConfirmBox from "../components/confirmBox.jsx";
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
  const [editingModule, setEditingModule] = useState(null);
  const [overlay,setOverlay]=useState(null);  
  const clickTimeoutRef = useRef(null);


  useEffect(()=>{
    fetchCourse().then((fetchedCourse)=>{
              if(fetchedCourse)
                  setCourse(fetchedCourse);
              else navigate('/');
          })
    fetchModuleCollection().then((fetchedMC)=>{
          if(fetchedMC)
          {
              setModuleCollection(fetchedMC);
              setModules(fetchedMC.modules);
          }
          else navigate('/');
      })

  },[courseId])


  const handleClick = (module, index) => {
    if (editingModule?.curIndex === index) {
      handleSaveEdit();
      return ;
    }
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    clickTimeoutRef.current = setTimeout(() => {
      navigate(`/course/${course._id}/module/${module._id}`);
    }, 250);
  };
  
  const handleDoubleClick = async(module,index) => {
    if (!course.isCreator) return;
    clearTimeout(clickTimeoutRef.current); // Clear the single click action
    if(editingModule)
      await handleSaveEdit();//saving previous changes
    const neweditingModule={prevTitle:module.title,curTitle:module.title,prevIndex:index,curIndex:index};
    setEditingModule(neweditingModule);
  };

  const handleTitleChange=(e)=>{
    setEditingModule({...editingModule ,curTitle:e.target.value});
    const updatedmodules=modules;
    updatedmodules[editingModule.curIndex].title=e.target.value;
    setModules(updatedmodules);
  }

  const handleSaveEdit = async() => {
    try{
        let promises=[];
        const index=editingModule.curIndex;
        if(!editingModule.curTitle)
            return toast.warn('module title is required');
        if(editingModule.prevTitle!==editingModule.curTitle)
          promises.push(axios.put(`/api/course/module/${course.moduleCollection}/update`,{
            moduleId:modules[index]._id,
            title:modules[index].title
          })
        )
        if(editingModule.prevIndex!==editingModule.curIndex)
          promises.push(axios.put(`/api/course/module/${course.moduleCollection}/reorder`,{
            oldIndex:editingModule.prevIndex,
            newIndex:editingModule.curIndex
          })
        )
        const results=await Promise.all(promises);
        results.forEach((result)=>toast.success(result.data.message));
        setEditingModule(null);
        setCache(moduleCollection._id,{...moduleCollection,modules})
      }catch(e){
        console.log(e);
        toast.error(e.response?.data?.message||"failed to remove module");
    }
  };

  const handleRemovemodule = async() => {
    const onConfirm=async ()=>{
        try{
        const {data}=await axios.delete(`/api/course/module/${course.moduleCollection}/remove`,
            {params:{moduleId:modules[editingModule.curIndex]._id,courseId:course._id}});
        const newModules=data.modules;
        const pageCount =data.pageCount;
        setCache(moduleCollection._id,{...moduleCollection,modules:newModules});
        setCache(course._id,{...course,pageCount})
        setModules(newModules);
        setEditingModule(null);
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
    const curIndex =editingModule.curIndex;
    const newIndex = direction === "left" ? curIndex - 1 : curIndex + 1;
    if (newIndex < 0 || newIndex >= modules.length) return;
    const updatedmodules = [...modules];
    [updatedmodules[curIndex], updatedmodules[newIndex]] = [updatedmodules[newIndex], updatedmodules[curIndex]];
    setModules(updatedmodules);
    setEditingModule({...editingModule,curIndex:newIndex});
  };

  const handleAddmodule = async() => {
    try{
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

  return (
    <>
    {overlay}
    <div className={styles.container}>
      <h1 className={styles.courseTitle} onClick={() => navigate(`/course/${course._id}/view`)}>
        {course.title}
      </h1>

      {editingModule !== null && (
        <div className={styles.editBox}>
          <input type="text" value={editingModule.curTitle} onChange={handleTitleChange}/>
          <button onClick={handleSaveEdit} className={styles.saveButton}>✔ Save</button>
          <button onClick={handleRemovemodule} className={styles.removeButton}>❌ Remove</button>
          <button onClick={() => handleShift("left")} className={styles.shiftButton}>⬅ Left</button>
          <button onClick={() => handleShift("right")} className={styles.shiftButton}>➡ Right</button>
        </div>
      )}

      <div className={styles.optionsGrid}>
        {modules.map((module, index) => (
          <div
            key={index}
            className={`${styles.optionCard} ${editingModule?.curIndex === index ? styles.editingHighlight : ""}`}
            onClick={() => handleClick(module, index)}
            onDoubleClick={() => course.isCreator && handleDoubleClick(module,index)}
          >
            <p>{module.title}</p>
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
