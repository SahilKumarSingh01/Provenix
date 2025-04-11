import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import axios from "../api/axios";
import { useEditingContent } from "../context/EditingContentContext";
import VideoUploader from "./VideoUploader.jsx";
import styles from "../styles/DisplayVideo.module.css";


const DisplayVideo = ({ item, index, contentSection, setContentSection,insight,updateInsight }) => {
  const { editingItem, setEditingItem, updateItemData, editingState } = useEditingContent();
  const [overlay, setOverlay] = useState(null);
  const [url, setUrl] = useState("");
  const [showVideo, setShowVideo] = useState(false);
  const [bookmarks,setBookmarks]=useState(insight?.data||[]);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const videoRef = useRef(null);

  const isEditing = editingItem === item;
  const { publicId } = isEditing ? editingState.curData : item.data || {};
  const isEmpty = !publicId;

  useEffect(()=>{
    if(insight?.data)
      setBookmarks(insight.data||[]);
  },[insight])

  const saveBookmarkEdit = () => {
    //you need some logic here 
    const updatedBookmarks=[...bookmarks];
    const {index,label}=editingBookmark;
    updatedBookmarks[index]={...updatedBookmarks[index],label};

    setBookmarks(updatedBookmarks);
    updateInsight({itemId:item._id,data:updatedBookmarks},index);
    setEditingBookmark(null);
  };


  const fetchSignedUrl = async (e) => {
    if (!publicId) return;
    console.log("fetching url")
    const currentTime = videoRef.current?.currentTime || 0;
    console.log(e.target.error);
    try {
      const { data } = await axios.get(`/api/course/content/${contentSection._id}/video`, {
        params: { itemId: item._id, courseId: contentSection.courseId },
      });
      setUrl(data.url);
      const handleSeek = () => {
        videoRef.current.currentTime = currentTime;
        const tryPlay = async () => {
          try {
            await videoRef.current.play();
          } catch (playError) {
            console.warn("Autoplay failed ", playError);
          }
        };
  
        tryPlay();
        videoRef.current.removeEventListener("loadedmetadata", handleSeek);
      };

      videoRef.current.addEventListener("loadedmetadata", handleSeek);
    } catch (err) {
      console.error(err);
      showVideo(false);
      toast.error(err?.response?.data?.message || "Failed to load video");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const addBookmark = () => {
    const time = videoRef.current?.currentTime || 0;
    // const label = prompt("Enter bookmark label:");
    const label='double click';
    if (!label) return;
    setBookmarks([...bookmarks,{time,label}])
  };

  const handleChangeVideo = () => {
    setOverlay(
      <VideoUploader
        onCancel={() => setOverlay(null)}
        onUpload={async (video) => {
          try {
            const formData = new FormData();
            formData.append("file", video);
            const { data } = await axios.post("api/upload/page-video", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });

            await setEditingItem(contentSection, setContentSection, index);
            updateItemData({ publicId: data.publicId });
            setUrl(data.url);
            toast.success("Video uploaded successfully");
            setOverlay(null);
          } catch (e) {
            toast.error(e?.response?.data?.message || "Failed to upload video");
          }
        }}
      />
    );
  };

  const startEditing = (e) =>{
    e.preventDefault();
    e.stopPropagation();
    contentSection.isCreator&&showVideo && setEditingItem(contentSection, setContentSection, index);
  }

  const renderControls = () =>
    isEditing && (
      <div className={styles.controls}>
        <button onClick={handleChangeVideo}>Change</button>
      </div>
    );
  return (
    <div className={styles.container} onDoubleClick={startEditing}>
      {overlay}
      {isEmpty ? (
        contentSection.isCreator && (
          <button className={styles.addButton} onClick={handleChangeVideo}>
            Add video here
          </button>
        )
      ) : (
        <div className={styles.videoWrapper}>
          {!showVideo ? (
            <div className={styles.thumbnail} onClick={() => setShowVideo(true)}>
              <div className={styles.playIcon}>▶</div>
            </div>
          ) : (
            <>
              <video
                crossOrigin="anonymous"
                ref={videoRef}
                src={url}
                controls
                controlsList="nodownload noremoteplayback"
                disablePictureInPicture
                onContextMenu={e => e.preventDefault()}
                className={styles.video}
                onError={fetchSignedUrl}
              />
             <details className={styles.bookmarkContainer}>
              <summary className={styles.bookmarkSummary}>Bookmarks</summary>
              <div className={styles.bookmarkList}>
                {bookmarks.map((bm, idx) => editingBookmark&&editingBookmark.index === idx ? 
                    (
                      <input
                        type="text"
                        autoFocus
                        value={editingBookmark.label}
                        onChange={(e) => setEditingBookmark({...editingBookmark,label:e.target.value})}
                        onBlur={saveBookmarkEdit}
                        className={styles.bookmarkInput}
                      />
                    ) : (
                      <button
                          key={idx}
                          onClick={() => {
                            videoRef.current.pause();
                            videoRef.current.currentTime = bm.time;
                            videoRef.current.play();
                          }}
                          data-title={bm.label}
                          onDoubleClick={(e)=>{
                              e.stopPropagation();
                              setEditingBookmark({index:idx,label:bm.label});
                          }}
                          className={styles.bookmarkBtn}
                        >
                        {bm.label} – {formatTime(bm.time)}
                      </button>

                    ))}
                  
                <button onClick={addBookmark} className={styles.addBookmark}>➕ Bookmark</button>

              </div>
            </details>
              {renderControls()}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DisplayVideo;
