import React, { useContext, useState ,useRef,useEffect } from "react";
import { useNavigate,useParams} from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import ConfirmBox from "../components/confirmBox.jsx";
import axios from '../api/axios';
import styles from "../styles/SectionList.module.css";

const SectionList = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  
  const { user } = useContext(AuthContext);
  const [course,setCourse]=useState(null);
  const [sections, setSections] = useState( []);
  const [editingSection, setEditingSection] = useState(null);
  const [overlay,setOverlay]=useState(null);  
  const clickTimeoutRef = useRef(null);

  
  const fetchCourse = async () => {
    try {
      const { data } = await axios.get(`/api/course/${courseId}`);
      setCourse(data.course);
      setSections(data.course.sections);
    } catch (e) {
      toast.error(e.response?.data?.message||"Failed to load course");
    }
  };

  const handleClick = (section, index) => {
    if (editingSection?.curIndex === index) {
      handleSaveEdit();
      return ;
    }
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    clickTimeoutRef.current = setTimeout(() => {
      navigate(`/course/page-list/`);
    }, 250);
  };
  
  const handleDoubleClick = async(section,index) => {
    if (!isCreator) return;
    clearTimeout(clickTimeoutRef.current); // Clear the single click action
    if(editingSection)
      await handleSaveEdit();//saving previous changes
    const newEditingSection={prevTitle:section.title,curTitle:section.title,prevIndex:index,curIndex:index};
    setEditingSection(newEditingSection);
  };

  const handleTitleChange=(e)=>{
    setEditingSection({...editingSection ,curTitle:e.target.value});
    const updatedSections=sections;
    updatedSections[editingSection.curIndex].title=e.target.value;
    setSections(updatedSections);
  }

  const handleSaveEdit = async() => {
    try{
        let promises=[];
        const index=editingSection.curIndex;
        if(!editingSection.curTitle)
            return toast.warn('Section title is required');
        if(editingSection.prevTitle!==editingSection.curTitle)
          promises.push(axios.put(`/api/course/${course._id}/update-section`,{
            sectionId:sections[index]._id,
            title:sections[index].title
          })
        )
        if(editingSection.prevIndex!==editingSection.curIndex)
          promises.push(axios.put(`/api/course/${course._id}/reorder-section`,{
            index1:editingSection.prevIndex,
            index2:editingSection.curIndex
          })
        )
        const results=await Promise.all(promises);
        results.forEach((result)=>toast.success(result.data.message));
        setEditingSection(null);
      }catch(e){
        console.log(e);
        toast.error(e.response?.data?.message||"failed to remove section");
    }
  };

  const handleRemoveSection = async() => {
    const onConfirm=async ()=>{
        try{
        const {data}=await axios.delete(`/api/course/${course._id}/remove-section`,
            {params:{fsdfds:"fdss",sectionId:sections[editingSection.curIndex]._id}});
        const newSections=data.sections;
        setSections(newSections);
        setEditingSection(null);
        toast.success(data.message);
      }catch(e){
          toast.error(e.response?.data?.message||"failed to remove section");
      }finally{
        onCancel();
      }
    }
    const onCancel=()=>{setOverlay(null)};
    const message=`Are you sure you want to delete this section? This action is irreversible.
                    All associated pages will be deleted, and their 
                    content will be permanently lost. Once deleted, it cannot be recovered.`;
    setOverlay(<ConfirmBox onConfirm={onConfirm} message={message} onCancel={onCancel}/>);
  };

  const handleShift = (direction) => {
    const curIndex =editingSection.curIndex;
    const newIndex = direction === "left" ? curIndex - 1 : curIndex + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;
    const updatedSections = [...sections];
    [updatedSections[curIndex], updatedSections[newIndex]] = [updatedSections[newIndex], updatedSections[curIndex]];
    setSections(updatedSections);
    setEditingSection({...editingSection,curIndex:newIndex});
  };

  const handleAddSection = async() => {
    try{
      const {data}=await axios.post(`/api/course/${course._id}/create-section`,{title:"Double click to edit"});
      const newSections=data.sections;
      setSections(newSections);
      toast.success(data.message);
    }catch(e){
        toast.error(e.response?.data?.message||"Failed to add section");
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]);


  if (!course) {
    return <p>Failed to load course</p>;
  }
  const isCreator =user?._id === course?.creator._id;
  return (
    <>
    {overlay}
    <div className={styles.container}>
      <h1 className={styles.courseTitle} onClick={() => navigate(`/course-view/${course._id}`)}>
        {course.title}
      </h1>

      {editingSection !== null && (
        <div className={styles.editBox}>
          <input type="text" value={editingSection.curTitle} onChange={handleTitleChange}/>
          <button onClick={handleSaveEdit} className={styles.saveButton}>✔ Save</button>
          <button onClick={handleRemoveSection} className={styles.removeButton}>❌ Remove</button>
          <button onClick={() => handleShift("left")} className={styles.shiftButton}>⬅ Left</button>
          <button onClick={() => handleShift("right")} className={styles.shiftButton}>➡ Right</button>
        </div>
      )}

      <div className={styles.optionsGrid}>
        {sections.map((section, index) => (
          <div
            key={index}
            className={`${styles.optionCard} ${editingSection?.curIndex === index ? styles.editingHighlight : ""}`}
            onClick={() => handleClick(section, index)}
            onDoubleClick={() => isCreator && handleDoubleClick(section,index)}
          >
            <p>{section.title}</p>
          </div>
        ))}

        {isCreator && (
          <div className={styles.addSectionCard} onClick={handleAddSection}>
            ➕ Add Section
          </div>
        )}
      </div>
    </div>
  </>
  );
};

export default SectionList;
