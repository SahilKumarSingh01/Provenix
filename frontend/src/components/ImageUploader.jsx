import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import styles from "../styles/ImageUploader.module.css";
import { toast } from "react-toastify";

const ImageUploader = ({ onCancel, onUpload, aspect ,forceCropping=true}) => {
  const [preview, setPreview] = useState(null);
  const [croppedPreview, setCroppedPreview] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropConfirmed, setCropConfirmed] = useState(false); // Toggle between "Confirm Selection" & "Crop Again"

  const handleButtonClick = async () => {
    if (!cropConfirmed) {
      await getCroppedImage();
      setCropConfirmed(true); // Switch to "Crop Again"
    } else {
      setCroppedPreview(null);
      setCropConfirmed(false); // Switch back to "Confirm Selection"
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10MB limit
      if (file.size > maxSize) {
        toast.error("File size exceeds 10MB. Please upload a smaller image.");
        return;
      }
      const url=URL.createObjectURL(file);
      setPreview(url);
      if(forceCropping)
      {
        setCroppedPreview(null); // Reset cropped state
        setCropConfirmed(false); // Reset crop toggle
      }
      else{
        setCroppedPreview(url);
        setCropConfirmed(true);
      }

    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImage = async () => {
    if (!preview || !croppedAreaPixels) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = preview;
    await new Promise((resolve) => (img.onload = resolve));

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;
    ctx.drawImage(
      img,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    canvas.toBlob((blob) => {
      const croppedImageUrl = URL.createObjectURL(blob);
      setCroppedPreview(croppedImageUrl);
    }, "image/jpeg");
  };

  const uploadCroppedImage = async () => {
    if (!croppedPreview) return;
    const response = await fetch(croppedPreview);
    const blob = await response.blob();
    onUpload(blob);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.uploaderForm}>
        <h2>Upload Image</h2>

        {preview && !croppedPreview && (
          <div className={styles.imageContainer}>
            <Cropper
              image={preview}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
        )}

        {croppedPreview && (
          <div className={styles.previewContainer}>
            <img src={croppedPreview} alt="Cropped Preview" className={styles.imageContainer} />
          </div>
        )}
        <input type="file" accept="image/*" className={styles.fileInput} onChange={handleFileChange} />
        <div className={styles.actions}>
          <button className={styles.actionButton} onClick={handleButtonClick} disabled={!preview}>
            {cropConfirmed ? "Crop" : "Confirm Selection"}
          </button>

          <button className={styles.actionButton} onClick={uploadCroppedImage} disabled={!croppedPreview}>
            Upload
          </button>

          <button className={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
