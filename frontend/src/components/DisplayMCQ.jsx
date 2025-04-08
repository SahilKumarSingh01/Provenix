import React, { useState ,useRef,useEffect} from "react";
import styles from "../styles/DisplayMCQ.module.css";
import { useEditingContent } from "../context/EditingContentContext";
import ImageUploader from "./ImageUploader";
import { toast } from "react-toastify";
import axios from "../api/axios";

const DisplayMCQ = ({ item, index, contentSection, setContentSection }) => {
  const [chosenOptionIndexes, setChosenOptionIndexes] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [overlay, setOverlay] = useState(null);
  const questionRef = useRef(null);
  const optionRefs = useRef([]);
  

  const { editingItem, setEditingItem, updateItemData, editingState } = useEditingContent();
  const isEditing = editingItem === item;
  const mcqData = isEditing ? editingState.curData : item.data;

  useEffect(() => {
    if (questionRef.current)      
      questionRef.current.style.height = `${questionRef.current.scrollHeight}px`;

    optionRefs.current.forEach((ref) => {
      if(ref)
        ref.style.height = `${ref.scrollHeight}px`
      });

  }, [isEditing]);

  const setImageOverlay = (type, idx) => {
    setOverlay(
      <ImageUploader
        aspect={4 / 3}
        onCancel={() => setOverlay(null)}
        onUpload={async (image) => {
          try {
            const formData = new FormData();
            formData.append("file", image);
            const { data } = await axios.post("api/upload/page-photo", formData, {
              headers: { "content-type": "multipart/form-data" },
            });

            const updatedData = { ...mcqData };
            if (type === "question") {
              updatedData.ques = { ...updatedData.ques, url: data.url, publicId: data.publicId };
            } else {
              updatedData.options[idx] = { ...updatedData.options[idx], url: data.url, publicId: data.publicId };
            }

            updateItemData(updatedData);
            setOverlay(null);
            toast.success("Image uploaded successfully");
          } catch (e) {
            toast.error(e?.response?.data?.message || "Failed to upload image");
          }
        }}
      />
    );
  };

  const handleInputChange = (key, idx, value,e) => {
    if (e?.target) {
      e.target.style.height = `${e.target.scrollHeight}px`; // set new height
    }
    if (key === "question") {
      updateItemData({ ...mcqData, ques: { ...mcqData.ques, text: value } });
    } else {
      const updatedOptions = mcqData.options.map((opt, i) =>
        i === idx ? { ...opt, text: value } : opt
      );
      updateItemData({ ...mcqData, options: updatedOptions });
    }
  };

  const handleCorrectChange = (idx, checked) => {
    const updatedOptions = mcqData.options.map((opt, i) =>
      i === idx ? { ...opt, isCorrect: checked } : opt
    );
    updateItemData({ ...mcqData, options: updatedOptions });
  };

  const handleAddOption = () => {
    updateItemData({ ...mcqData, options: [...mcqData.options, { text: "", isCorrect: false }] });
  };

  const handleDeleteOption = (idx) => {
    if (mcqData.options.length > 2) {
      const updatedOptions = mcqData.options.filter((_, i) => i !== idx);
      updateItemData({ ...mcqData, options: updatedOptions });
    }
  };

  const toggleOptionSelection = (idx) => {
    setChosenOptionIndexes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const toggleVerify = () => {
    if (showResult) {
      setChosenOptionIndexes([]);
      setShowResult(false);
    } else {
      setShowResult(true);
    }
  };

  const handleDoubleClick = () => {
    if (contentSection.isCreator) {
      setEditingItem(contentSection, setContentSection, index);
    }
  };

  return (
    <>
      {overlay}
      <div className={styles.mcqBox} onDoubleClick={isEditing ? null : handleDoubleClick}>
        {isEditing ? (
          <>
            <div className={styles.questionRow}>
              <div className={styles.textImageWrapper}>
                <textarea
                  ref={questionRef}
                  className={styles.questionInput}
                  value={mcqData.ques.text}
                  onChange={(e) => handleInputChange("question", null, e.target.value,e)}
                  placeholder="Enter your question"
                />
                {mcqData.ques.url && (
                  <img src={mcqData.ques.url} className={styles.mcqImage} alt="Question" />
                )}
              </div>

              <button className={styles.imageButton} onClick={() => setImageOverlay("question")}>
                {mcqData.ques.url ? "Edit Image" : "Add Image"}
              </button>
            </div>


            <ul className={styles.options}>
              {mcqData.options.map((opt, idx) => (
                <li key={idx} className={styles.optionRow}>
                  <div className={styles.textImageWrapper}>
                    <textarea
                      ref={(el) => (optionRefs.current[idx] = el)}

                      className={styles.optionInput}
                      value={opt.text}
                      onChange={(e) => handleInputChange("option", idx, e.target.value,e)}
                    />
                    {opt.url && <img src={opt.url} className={styles.mcqImage} alt={`Option ${idx + 1}`} />}
                  </div>
                  <input
                    type="checkbox"
                    checked={opt.isCorrect || false}
                    onChange={(e) => handleCorrectChange(idx, e.target.checked)}
                    title="Mark as Correct"
                  />
                  <label className={styles.correctLabel}>Correct</label>
                  {mcqData.options.length > 2 && (
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteOption(idx)}
                      title="Delete Option"
                    >
                      x
                    </button>
                  )}
                  <button className={styles.imageButton} onClick={() => setImageOverlay("option", idx)}>
                    {opt.url ? "Edit Image" : "Add Image"}
                  </button>
                </li>
              ))}
            </ul>

            <button className={styles.addButton} onClick={handleAddOption}>
              + Add Option
            </button>
          </>
        ) : (
          <>
            <div className={styles.questionRow}>

              <div className={styles.textImageWrapper}>
                <p className={styles.questionText}>{mcqData.ques.text}</p>
                {mcqData.ques.url && (
                  <img src={mcqData.ques.url} className={styles.mcqImage} alt="Question" />
                )}
              </div>
            </div>

            <ul className={styles.options}>
              {mcqData.options.map((opt, idx) => {
                const base = styles.optionText;
                const selected = chosenOptionIndexes.includes(idx);
                const isCorrect = opt.isCorrect;

                const optionClass = [
                  base,
                  showResult && isCorrect && styles.correctOption,
                  showResult && !isCorrect && selected && styles.incorrectOption,
                  !showResult && selected && styles.selectedOption,
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <li key={idx} className={optionClass} onClick={() => !showResult && toggleOptionSelection(idx)}>
                    <div className={styles.textImageWrapper}>
                      <span>{opt.text}</span>
                      {opt.url && (
                        <img src={opt.url} className={styles.mcqImage} alt={`Option ${idx + 1}`} />
                      )}
                    </div>
                  </li>

                );
              })}
            </ul>

            <button
              className={styles.verifyButton}
              onClick={toggleVerify}
              disabled={chosenOptionIndexes.length === 0}
            >
              {showResult ? "Clear" : "Verify"}
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default DisplayMCQ;
