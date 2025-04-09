import React, { useState } from "react";
import styles from "../styles/VideoUploader.module.css";
import { toast } from "react-toastify";

const VideoUploader = ({ onCancel, onUpload }) => {
  const [preview, setPreview] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const maxSize = 100 * 1024 * 1024; // 50MB limit
      if (file.size > maxSize) {
        toast.error("File size exceeds 50MB. Please upload a smaller video.");
        return;
      }
      setPreview(URL.createObjectURL(file));
      setVideoFile(file);
    }
  };

  const uploadVideo = async () => {
    if (!videoFile) return;
    onUpload(videoFile);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.uploaderForm}>
        <h2>Upload Video</h2>

        {preview && (
          <div className={styles.videoContainer}>
            <video controls className={styles.video} src={preview}></video>
          </div>
        )}

        <input
          type="file"
          accept="video/*"
          className={styles.fileInput}
          onChange={handleFileChange}
        />

        <div className={styles.actions}>
          <button
            className={styles.actionButton}
            onClick={uploadVideo}
            disabled={!videoFile}
          >
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

export default VideoUploader;
