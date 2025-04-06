import React, { useState, useRef, useEffect } from "react";
import styles from "../styles/DisplayHidden.module.css";
import DisplayContents from "./DisplayContents";
import { useEditingContent } from "../context/EditingContentContext";

const DisplayHidden = ({ item, index, contentSection, setContentSection }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef(null);
  const clickTimeoutRef = useRef(null);

  const {
    editingState,
    editingItem,
    setEditingItem,
    updateItemData
  } = useEditingContent();
  const handleClick = () => {
    if(editingItem === item )return;
    if (!contentSection.isCreator) return setIsExpanded(prev => !prev);;
    clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      setIsExpanded(prev => !prev);
    },250);
  };
  
  const handleDoubleClick = async () => {
    if (!contentSection.isCreator) return;
    clearTimeout(clickTimeoutRef.current);
    setEditingItem(contentSection, setContentSection, index);
  };
  

  const handleChange = (e) => {
    updateItemData({...item.data,name:e.target.value});
    adjustHeight();
  };

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  };

  useEffect(() => {
    if (editingItem === item && textareaRef.current) {
      adjustHeight();
    }
  }, [editingState.curData]);

  return (
    <div className={`${styles.container} ${isExpanded ? styles.leftBorder : ""}`}>
      <div className={styles.header} onClick={handleClick} onDoubleClick={() => contentSection.isCreator && handleDoubleClick()}>
        <span className={styles.arrow}>{!isExpanded ? "▶" : "▼"}</span>
          {editingItem === item ? (
            <textarea
              ref={textareaRef}
              value={editingState.curData.name}
              onChange={handleChange}
              autoFocus
              className={styles.textarea}
            />
          ) : (
            item.data.name
          )}
      </div>

      {isExpanded && (
        <div className={styles.contentWrapper}>
          <DisplayContents 
            contentSectionId={item.data.contentSectionId} 
            parentSection={contentSection}
            setParentSection={setContentSection}
          />
        </div>
      )}
    </div>
  );
};

export default DisplayHidden;
