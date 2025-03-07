import React, { useState } from "react";

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

  // Remove image function
  const handleRemoveImage = () => {
    setPreview("");
    onImageUpload(""); // Clear the image from parent form
  };

  return (
    <div className="image-uploader">
      <input type="file" accept="image/*" onChange={handleImageChange} />

      {preview && (
        <div className="thumbnail-preview">
          <img src={preview} alt="Thumbnail Preview" className="image-preview" />
          <button onClick={handleRemoveImage} className="remove-btn">Remove</button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
