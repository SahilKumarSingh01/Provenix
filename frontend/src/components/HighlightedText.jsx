import React, { useState, useEffect } from "react";
import styles from "../styles/HighlightedText.module.css";

const HighlightedText = ({ text, insight, updateInsight, isCreator }) => {
  const [showDeleteMenu, setShowDeleteMenu] = useState(null);

  // Automatically add/remove scroll listener based on showDeleteMenu state
  useEffect(() => {
    if (showDeleteMenu) {
      window.addEventListener("scroll", handleScrollClose);
    }

    return () => {
      window.removeEventListener("scroll", handleScrollClose);
    };
  }, [showDeleteMenu]);

  const handleHighlightClick = (index, event) => {
    if (isCreator) return;

    if (showDeleteMenu && index === showDeleteMenu.index) {
      setShowDeleteMenu(null);
      return;
    }

    setShowDeleteMenu({ index, x: event.clientX, y: event.clientY });
  };

  const handleScrollClose = () => {
    setShowDeleteMenu(null);
  };

  const deleteHighlight = () => {
    const updated = [...insight];
    updated.splice(showDeleteMenu.index, 1);
    updateInsight(updated);
    setShowDeleteMenu(null);
  };

  const renderText = () => {
    let result = [];
    let lastIndex = 0;

    insight.forEach(([start, end], idx) => {
      if (start > lastIndex) {
        result.push(
          <span
            key={`normal-${idx}`}
            className={styles.unhighlighted}
            data-startoffset={lastIndex}
          >
            {text.slice(lastIndex, start)}
          </span>
        );
      }

      result.push(
        <span
          key={`highlight-${idx}`}
          className={styles.highlighted}
          onClick={(e) => handleHighlightClick(idx, e)}
          data-startoffset={start}
        >
          {text.slice(start, end)}
        </span>
      );

      lastIndex = end;
    });

    if (lastIndex < text.length) {
      result.push(
        <span
          key="last-normal"
          className={styles.unhighlighted}
          data-startoffset={lastIndex}
        >
          {text.slice(lastIndex)}
        </span>
      );
    }

    return result;
  };

  return (
    <>
      {renderText()}
      {showDeleteMenu && (
        <div
          className={styles.deleteMenu}
          style={{ top: showDeleteMenu.y, left: showDeleteMenu.x }}
          onClick={deleteHighlight}
        >
          Remove Highlight
        </div>
      )}
    </>
  );
};

export default HighlightedText;
