import React, { useState } from "react";
import styles from "./DisplayHeading.module.css";

const DisplayHeading = ({ item, index, items, isCreator }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(item.data);
  const [insight, setInsight] = useState(item.insight || []);
  const [showDeleteMenu, setShowDeleteMenu] = useState(null); // Position of delete menu

  // Handle text change when editing (only for creators)
  const handleChange = (e) => {
    setContent(e.target.value);
    const updatedItems = [...items];
    updatedItems[index].content = e.target.value;
  };
  const handleInsightUpdate=()=>{

  }
  const handleBlur = () => setIsEditing(false);

  // Function to merge overlapping highlights
  const mergeHighlights = (newInsight) => {
    const merged = [...insight, newInsight].sort((a, b) => a[0] - b[0]);
    let result = [];

    merged.forEach(([start, end]) => {
      if (result.length && result[result.length - 1][1] >= start) {
        result[result.length - 1][1] = Math.max(result[result.length - 1][1], end);
      } else {
        result.push([start, end]);
      }
    });

    return result;
  };

  // Handle user highlighting text (only for non-creators)
  const handleMouseUp = () => {
    if (isCreator || !window.getSelection) return; // Skip if user is creator
  
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
  
    const range = selection.getRangeAt(0);
    const startNode = range.startContainer.parentElement;
    const endNode = range.endContainer.parentElement;
    console.log(startNode,endNode);
    if (!startNode || !endNode) return; // Ensure valid elements
  
    const startBaseOffset = parseInt(startNode.getAttribute("data-startOffset")) || 0;
    const endBaseOffset = parseInt(endNode.getAttribute("data-startOffset")) || 0;
  
    const start = startBaseOffset + range.startOffset;
    const end = endBaseOffset + range.endOffset;
  
    if (start !== end) {
      setInsight(mergeHighlights([Math.min(start, end), Math.max(start, end)]));
    }
  };

  // Handle clicking on a highlighted section to remove it
  const handleHighlightClick = (index, event) => {
    if (isCreator) return; // Only non-creators can remove highlights
    if(showDeleteMenu&&index==showDeleteMenu.index)
    {
      setShowDeleteMenu(null);
      return;
    }
    setShowDeleteMenu({ index, x: event.pageX, y: event.pageY });
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
          <span key={`normal-${idx}`} className={styles.unhighlighted} data-startOffset={lastIndex}> 
            {content.slice(lastIndex, start)}
          </span>
        );
      }
      result.push(
        <span
          key={`highlight-${idx}`}
          className={styles.highlighted}
          onClick={(e) => handleHighlightClick(idx, e)}
          data-startOffset={lastIndex}
        >
          {content.slice(start, end)}
        </span>
      );
      lastIndex = end;
    });

    if (lastIndex < content.length) {
      result.push(
        <span key="last-normal" className={styles.unhighlighted} data-startOffset={lastIndex}>
          {content.slice(lastIndex)}
        </span>
      );
    }

    return result;
  };

  return (
    <div onMouseUp={handleMouseUp}>
      {isEditing ? (
        <input
          type="text"
          value={content}
          onChange={handleChange}
          onBlur={handleBlur}
          autoFocus
          className={styles.editInput}
        />
      ) : (
        <h1 onDoubleClick={() => isCreator && setIsEditing(true)} className={styles.heading}>
          {renderHighlightedText()}
        </h1>
      )}

      {showDeleteMenu && (
        <div
          className={styles.deleteMenu}
          style={{ top: showDeleteMenu.y, left: showDeleteMenu.x }}
          onClick={deleteHighlight}
        >
          Remove Highlight
        </div>
      )}
    </div>
  );
};

export default DisplayHeading;
