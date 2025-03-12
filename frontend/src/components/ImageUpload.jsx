import React, { useState } from "react";
import styles from "../styles/ImageUpload.module.css"; // Importing the CSS module

const ImageUploader = ({ onImageUpload }) => {
  const [preview, setPreview] = useState("");

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onImageUpload(reader.result); // Pass the image URL to parent component
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreview("");
    onImageUpload(""); // Clear the image from parent form
  };

  return (
    <div className={styles.imageUploader}>
      <input type="file" accept="image/*" onChange={handleImageChange} className={styles.inputFile} />

      {preview && (
        <div className={styles.thumbnailPreview}>
          <img src={preview} alt="Thumbnail Preview" className={styles.imagePreview} />
          <button onClick={handleRemoveImage} className={styles.removeBtn}>Remove</button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
