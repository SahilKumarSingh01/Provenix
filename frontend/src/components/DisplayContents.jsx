import React, { useState, useEffect } from "react";
import { useCourse } from "../context/CourseContext";
import axios from '../api/axios.js';

import styles from "../styles/DisplayContents.module.css"; // Assuming you use CSS modules

// Importing display components
import DisplayHeading from "./DisplayHeading.jsx";
// import DisplayText from "./DisplayText";
// import DisplayCode from "./DisplayCode";
// import DisplayMCQ from "./DisplayMCQ";
// import DisplayHidden from "./DisplayHidden";
// import DisplayReference from "./DisplayReference";

const DisplayContents = ({ contentSectionId }) => {
  const { fetchContentSection } = useCourse();
  const [contentSection, setContentSection] = useState(null);
  const [items, setItems] = useState([]);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      const fetchedCS = await fetchContentSection(contentSectionId);
      if (fetchedCS) {
        setContentSection(fetchedCS);
        setItems(fetchedCS.items);
      }
    };
    fetchAll();
  }, [contentSectionId]);

  const addElement = async (type) => {
    try{
      const {data}=await axios.post(`/api/course/content/${contentSectionId}/${type}`);
      const newItem=data.newItem;
      const updatedItems=[...items,newItem];
      setItems(updatedItems);
      setCache(contentSection._id,{...contentSection,items:updatedItems});
      toast.success(data.message);
    }catch(e){
      console.log(e);
        toast.error(e.response?.data?.message||"Failed to add module");
    }
    finally{
      setShowMenu(false);
    }
  };

  if (!contentSection) return <p>Loading content...</p>;

  return (
    <div className={styles.container}>
      {/* Render Content */}
      {items.map((item, index) => {
          switch (item.type) {
            case "heading":
              return <DisplayHeading key={index} item={item} index={index} items={items} isCreator={contentSection.isCreator} />;
            case "text":
              return <DisplayText key={index} item={item} index={index} items={items} isCreator={contentSection.isCreator} />;
            case "code":
              return <DisplayCode key={index} item={item} index={index} items={items} isCreator={contentSection.isCreator} />;
            case "MCQ":
              return <DisplayMCQ key={index} item={item} index={index} items={items} isCreator={contentSection.isCreator} />;
            case "hidden":
              return <DisplayHidden key={index} item={item} index={index} items={items} isCreator={contentSection.isCreator} />;
            case "reference":
              return <DisplayReference key={index} item={item} index={index} items={items} isCreator={contentSection.isCreator} />;
            default:
              return null;
          }
        })}

      {/* Add Element Button */}
      {contentSection.isCreator&&<button className={styles.addButton} onClick={() => setShowMenu(!showMenu)}>+ Add Element</button>}

      {/* Quick Selection Menu */}
      {showMenu && (
        <div className={styles.selectionMenu}>
          {["heading", "text", "code", "MCQ", "hidden", "reference"].map((type) => (
            <button key={type} onClick={() => addElement(type)}>{type}</button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DisplayContents;
