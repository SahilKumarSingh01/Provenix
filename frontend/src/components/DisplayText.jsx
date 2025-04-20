import React, { useState, useRef, useEffect } from "react";
import styles from "../styles/DisplayText.module.css"; // make sure this exists or adjust the path
import mergeInterval from "../utils/mergeIntervals";
import { useEditingContent } from "../context/EditingContentContext";

const DisplayText = ({ item, index, contentSection, setContentSection ,insight,updateInsight}) => {
  const [highlights, setHighlights] = useState(insight?.data || []);
  const [showDeleteMenu, setShowDeleteMenu] = useState(null);
  const textareaRef = useRef(null);
  const { editingState, editingItem, setEditingItem, updateItemData } = useEditingContent();
  const text = item.data;
  const handleChange = (e) => {
    updateItemData(e.target.value);
    adjustHeight();
  };
 
  useEffect(() => {
    if (textareaRef.current) adjustHeight();
    return ()=>{cleanupScrollListener()};
  }, [editingItem]);
  useEffect(()=>{
    setHighlights(insight?.data||[]);
  },[insight])
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    textarea.style.height = 'auto'; // Reset the height before calculating
    textarea.style.height = textarea.scrollHeight + "px";
  };

  const handleMouseUp = () => {
    if (contentSection.isCreator || !window.getSelection) return;

    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const startNode = range.startContainer.parentElement;
    const endNode = range.endContainer.parentElement;
    if (!startNode || !endNode || startNode.parentElement !== endNode.parentElement) return;

    const startBaseOffset = parseInt(startNode.getAttribute("data-startoffset")) || 0;
    const endBaseOffset = parseInt(endNode.getAttribute("data-startoffset")) || 0;

    const start = startBaseOffset + range.startOffset;
    const end = endBaseOffset + range.endOffset;

    if (start < end) {
      const updatedHighlights = mergeInterval([...highlights, [start, end]]);
      setHighlights(updatedHighlights);
      contentSection.isEnrolled&&updateInsight({itemId:item._id,data:updatedHighlights},index);
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

  const deleteHighlight = () => {
    const updatedHighlights = [...highlights];
    updatedHighlights.splice(showDeleteMenu.index, 1);
    setHighlights(updatedHighlights);
    contentSection.isEnrolled&&updateInsight({itemId:item._id,data:updatedHighlights},index);
    setShowDeleteMenu(null);
  };

  const renderHighlightedText = () => {
    let result = [];
    let lastIndex = 0;

    highlights.forEach(([start, end], idx) => {
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
      {editingItem === item ? (
        <textarea ref={textareaRef} value={editingState.curData} onChange={handleChange} autoFocus className={styles.textarea}/>
      ) : (
        <p onDoubleClick={() => contentSection.isCreator && setEditingItem(contentSection, setContentSection, index)} className={styles.paragraph}>
          {renderHighlightedText()}
        </p>
      )}

      {showDeleteMenu && (
        <div className={styles.deleteMenu} style={{ top:showDeleteMenu.y , left: showDeleteMenu.x }} onClick={deleteHighlight}>
          Delete
        </div>
      )}
    </div>
  );
};

export default DisplayText;
