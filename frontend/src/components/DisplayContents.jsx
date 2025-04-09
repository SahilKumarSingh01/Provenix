import React, { useState, useEffect } from "react";

import { useCourse } from "../context/CourseContext";
import axios from '../api/axios.js';
import styles from "../styles/DisplayContents.module.css"; // Assuming you use CSS modules
import { useEditingContent } from "../context/EditingContentContext"; // adjust path if needed
import { toast } from "react-toastify";

// Importing display components
import DisplayHeading from "./DisplayHeading";
import DisplayText from "./DisplayText";
import DisplayCode from "./DisplayCode";
import DisplayImage from "./DisplayImage.jsx";
import DisplayVideo from "./DisplayVideo.jsx";

import DisplayMCQ from "./DisplayMCQ.jsx";
import DisplayHidden from "./DisplayHidden";
import DisplayReference from "./DisplayReference";
import { useCache } from "../context/CacheContext.jsx";

const DisplayContents = ({ contentSectionId }) => {
  const { fetchContentSection } = useCourse();
  const {setCache}=useCache();
  const [contentSection, setContentSection] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const {editingState,saveEditing}=useEditingContent();
  useEffect(() => {
    const fetchAll = async () => {
      const fetchedCS = await fetchContentSection(contentSectionId);
      if(!fetchedCS)return;
      setContentSection(fetchedCS);
    }
    fetchAll();
  }, [contentSectionId]);
  // console.log("from content Display",contentSection);
  const addElement = async (type) => {
    try{
      await saveEditing();
      const {data}=await axios.post(`/api/course/content/${contentSectionId}/${type}`);
      const updatedSection={...contentSection,items:data.items};
      setCache(contentSection._id,updatedSection);
      setContentSection(updatedSection);
      toast.success(data.message);
    }catch(e){
      console.log(e);
        toast.error(e.response?.data?.message||"Failed to add module");
    }
    finally{
      setShowMenu(false);
    }
  };
  const codeData = [
    { lang: "JavaScript", data: "console.log('Hello, World!');\nlet x = 10;" },
    { lang: "Python", data: "print('Hello, World!')\nx = 10" },
  ];
  if (!contentSection) return <p>Loading content...</p>;
  const itemsToDisplay=editingState.contentSection?._id==contentSection._id?editingState.items:contentSection.items;
  return (
    <div className={styles.container}>
      {/* Render Content */}
      {itemsToDisplay.map((item, index) => {
          switch (item.type) {
            case "heading":
              return <DisplayHeading 
                        key={index} 
                        item={item} 
                        index={index}
                        contentSection={contentSection}
                        setContentSection={setContentSection} />;
            case "text":
              return <DisplayText 
                        key={index} 
                        item={item} 
                        index={index}
                        contentSection={contentSection}
                        setContentSection={setContentSection} />;
            case "code":
              return <DisplayCode 
                        key={index} 
                        item={item} 
                        index={index}
                        contentSection={contentSection}
                        setContentSection={setContentSection} />;
            case "mcq":
              return <DisplayMCQ 
                        key={index} 
                        item={item} 
                        index={index}
                        contentSection={contentSection}
                        setContentSection={setContentSection} />;
            case "hidden":
              return <DisplayHidden 
                        key={index} 
                        item={item} 
                        index={index}
                        contentSection={contentSection}
                        setContentSection={setContentSection} />;
            case "reference":
              return <DisplayReference 
                        key={index} 
                        item={item} 
                        index={index}
                        contentSection={contentSection}
                        setContentSection={setContentSection} />;
            case "image":
              return <DisplayImage 
                        key={index} 
                        item={item} 
                        index={index}
                        contentSection={contentSection}
                        setContentSection={setContentSection} />;
            case "video":
              return <DisplayVideo 
                        key={index} 
                        item={item} 
                        index={index}
                        contentSection={contentSection}
                        setContentSection={setContentSection} />;
            default:
              return null;
          }
        })}

      {/* Add Element Button */}
      {contentSection.isCreator&&<button className={styles.addButton} onClick={() => setShowMenu(!showMenu)}>
        + Add Element
      </button>}

      {/* Quick Selection Menu */}
      {showMenu && (
        <div className={styles.selectionMenu}>
          {["heading", "text", "code", "mcq", "hidden", "reference","image","video"].map((type) => (
            <button key={type} onClick={() => addElement(type)}>{type}</button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DisplayContents;
