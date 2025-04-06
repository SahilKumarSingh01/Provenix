import React, { useEffect, useRef } from "react";
import styles from "../styles/DisplayReference.module.css";
import { useEditingContent } from "../context/EditingContentContext";

const DisplayReference = ({ item, index, contentSection, setContentSection }) => {
  const {
    editingItem,
    editingState,
    setEditingItem,
    updateItemData
  } = useEditingContent();
//   contentSection.isEnrolled=true;
  const isEditing = editingItem === item;

  const handleDoubleClick = () => {
    if (!contentSection.isCreator) return;
    setEditingItem(contentSection, setContentSection, index);
  };

  const handleChange = (field, value) => {
    updateItemData({ ...editingState.curData, [field]: value });
  };

  const renderViewMode = () => (
    <div className={styles.container} onDoubleClick={handleDoubleClick }>
    <div className={styles.contentWrapper}>
    <span className={styles.title} onClick={() => window.open(item.data.url, "_blank")}>{item.data.title}</span>
    <span className={styles.platform}>{item.data.platform}</span>
    <span className={`${styles.difficulty} ${styles["difficulty" + item.data.difficulty]}`}>
      {item.data.difficulty}
    </span>
    <input
        type="checkbox"
        className={styles.tickBox}
        // checked={false}
        // disabled={!contentSection.isEnrolled}
        onChange={(e) =>{}
        //   updateItemData({ ...item.data, completed: e.target.checked })
        }
    />
    </div>
  </div>
  
  );

  const renderEditMode = () => (
    <div className={styles.container}>
      <label htmlFor="title" className={styles.inputLabel}>Title:</label>
      <input
        id="title"
        className={styles.input}
        value={editingState.curData.title}
        onChange={(e) => handleChange("title", e.target.value)}
        placeholder="Title"
      />
      
      <label htmlFor="url" className={styles.inputLabel}>URL:</label>
      <input
        id="url"
        className={styles.input}
        value={editingState.curData.url}
        onChange={(e) => handleChange("url", e.target.value)}
        placeholder="URL"
      />
      
      <label htmlFor="platform" className={styles.inputLabel}>Platform:</label>
      <input
        id="platform"
        className={styles.input}
        value={editingState.curData.platform}
        onChange={(e) => handleChange("platform", e.target.value)}
        placeholder="Platform"
      />
      
      <label htmlFor="difficulty" className={styles.inputLabel}>Difficulty:</label>
      <select
        id="difficulty"
        className={styles.input}
        value={editingState.curData.difficulty}
        onChange={(e) => handleChange("difficulty", e.target.value)}
      >
        <option value="Easy">Easy</option>
        <option value="Medium">Medium</option>
        <option value="Hard">Hard</option>
      </select>

    </div>
  );

  return isEditing ? renderEditMode() : renderViewMode();
};

export default DisplayReference;
