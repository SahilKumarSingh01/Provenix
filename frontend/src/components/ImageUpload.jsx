import React, { useState } from "react";


const ImageUpload = () => {
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit.");
        setImage(null);
      } else {
        setError("");
        setImage(URL.createObjectURL(file));
      }
    }
  };

  return (
    <div className="image-upload-container">
      <h2>Upload Image</h2>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      {error && <p className="error-message">{error}</p>}
      {image && <img src={image} alt="Uploaded Preview" className="image-preview" />}
    </div>
  );
};

export default ImageUpload;
