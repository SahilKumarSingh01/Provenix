import React, { useState, useRef, useEffect } from "react";
import styles from "../styles/DisplayHeading.module.css";
import mergeInterval from "../utils/mergeIntervals";
import { useEditingContent } from "../context/EditingContentContext"; // adjust path if needed

const DisplayHeading = ({ item,index,contentSection ,setContentSection}) => {
  const [insight, setInsight] = useState(item.insight || []);
  const [showDeleteMenu, setShowDeleteMenu] = useState(null); // Position of delete menu
  const textareaRef = useRef(null);
  const {editingState, editingItem,setEditingItem,updateItemData} = useEditingContent();
  const text=item.data;
  // Handle text change when editing (only for creators)
  const handleChange = (e) => {
    updateItemData(e.target.value);
    adjustHeight(); // Call this after updating text
  };
  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
    return ()=>{cleanupScrollListener()};
  }, [editingState.curData]);
  
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    textarea.style.height = textarea.scrollHeight + "px"; // Set to scroll height
  };

  const handleEdit=()=>{
    setEditingItem(contentSection,setContentSection,index);
  }

  // Handle user highlighting text (only for non-creators)
  const handleMouseUp = () => {
    if (contentSection.isCreator || !window.getSelection) return; // Skip if user is creator
  
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
  
    const range = selection.getRangeAt(0);
    const startNode = range.startContainer.parentElement;
    const endNode = range.endContainer.parentElement;
    if (!startNode || !endNode||startNode.parentElement !== endNode.parentElement) return; 

    const startBaseOffset = parseInt(startNode.getAttribute("data-startoffset")) || 0;
    const endBaseOffset = parseInt(endNode.getAttribute("data-startoffset")) || 0;
  
    const start = startBaseOffset + range.startOffset;
    const end = endBaseOffset + range.endOffset;

    if (start < end) {
      const updatedInsight=mergeInterval([...insight,[start,end]]);
      setInsight(updatedInsight);
      window.getSelection().removeAllRanges();
    }
  };

  // Handle clicking on a highlighted section to remove it
  const handleHighlightClick = (index, event) => {
    if (contentSection.isCreator) return;

    if (showDeleteMenu && index === showDeleteMenu.index) {
      setShowDeleteMenu(null);
      cleanupScrollListener(); // remove listener if already there
      return;
    }
  
        setShowDeleteMenu({ index, x: event.clientX, y: event.clientY });
    window.addEventListener("scroll", handleScrollClose);
  };

  const cleanupScrollListener = () => {
    window.removeEventListener("scroll", handleScrollClose);
  };
  
  // Helper to close the menu & remove scroll listener
  const handleScrollClose = () => {
    setShowDeleteMenu(null);
    window.removeEventListener("scroll", handleScrollClose);
  };

  // Confirm deletion of a highlight
  const deleteHighlight = () => {
    const updatedInsight = [...insight];
    updatedInsight.splice(showDeleteMenu.index, 1);
    setInsight(updatedInsight);
    setShowDeleteMenu(null);
  };

  // Function to render text with highlights
  const renderHighlightedText = () => {
    let result = [];
    let lastIndex = 0;

    insight.forEach(([start, end], idx) => {
      if (start > lastIndex) {
        result.push(
          <span key={`normal-${idx}`} className={styles.unhighlighted} data-startoffset={lastIndex}> 
            {text.slice(lastIndex, start)}
          </span>
        );
      }
      result.push(
        <span key={`highlight-${idx}`} className={styles.highlighted} onClick={(e) => handleHighlightClick(idx, e)} data-startoffset={start}>
          {text.slice(start, end)}
        </span>
      );
      lastIndex = end;
    });

    if (lastIndex < text.length) {
      result.push(
        <span key="last-normal" className={styles.unhighlighted} data-startoffset={lastIndex}>
          {text.slice(lastIndex)}
        </span>
      );
    }

    return result;
  };
  return (
    <div onMouseUp={handleMouseUp}>
      {editingItem==item? (
        <textarea
          ref={textareaRef}
          value={editingState.curData}
          onChange={handleChange}
          autoFocus
          className={styles.textarea}
        />
      ) : (
        <h2 onDoubleClick={() => contentSection.isCreator&&handleEdit()} className={styles.heading}>
          {renderHighlightedText()}
        </h2>
      )}

      {showDeleteMenu && (
        <div className={styles.deleteMenu} style={{ top: showDeleteMenu.y, left: showDeleteMenu.x }} onClick={deleteHighlight}>
          Delete
        </div>
      )}
    </div>
  );
};

export default DisplayHeading;
