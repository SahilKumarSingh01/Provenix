import React, { useState } from "react";
import "../styles/VideoUpload.css";


const VideoUpload = () => {
  const [video, setVideo] = useState(null);
  const [error, setError] = useState("");

  const handleVideoChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        setError("File size exceeds 100MB limit.");
        setVideo(null);
      } else {
        setError("");
        setVideo(URL.createObjectURL(file));
      }
    }
  };

  return (
    <div className="video-upload-container">
      <h2>Upload Video</h2>
      <input type="file" accept="video/*" onChange={handleVideoChange} />
      {error && <p className="error-message">{error}</p>}
      {video && (
        <video controls className="video-preview">
          <source src={video} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
};

export default VideoUpload;
