import React, { useState } from "react";
import styles from "../styles/DisplayImage.module.css";
import { toast } from "react-toastify";
import axios from "../api/axios";
import { useEditingContent } from "../context/EditingContentContext";
import ImageUploader from "./ImageUploader";

const DisplayImage = ({ item, index, contentSection, setContentSection }) => {
  const { editingItem, setEditingItem, updateItemData, editingState } = useEditingContent();
  const [overlay, setOverlay] = useState(null);

  const isEditing = editingItem === item;
  const { url, publicId } = isEditing ? editingState.curData : item.data || {};
  const isEmpty = !url;

  const startEditing = () => contentSection.isCreator && setEditingItem(contentSection, setContentSection, index);

  const handleChangeImage = () => {
    setOverlay(
      <ImageUploader
        onCancel={() => setOverlay(null)}
        onUpload={async (image) => {
          try {
            const formData = new FormData();
            formData.append("file", image);
            const { data } = await axios.post("api/upload/page-photo", formData, {
              headers: { "content-type": "multipart/form-data" },
            });
            await setEditingItem(contentSection, setContentSection, index);
            updateItemData({ publicId: data.publicId, url: data.url });
            setOverlay(null);
            toast.success("Image uploaded successfully");
          } catch (e) {
            toast.error(e?.response?.data?.message || "Failed to upload image");
          }
        }}
        aspect={4 / 3}
        forceCropping={false}
      />
    );
  };

  return (
    <div className={styles.container}>
      {overlay}
      {isEmpty ? (
        contentSection.isCreator && (
          <button className={styles.addButton} onClick={handleChangeImage}>
            Add image here
          </button>
        )
      ) : (
        <div className={styles.imageWrapper}>
          <img src={url} alt="content-img" className={styles.image} onDoubleClick={startEditing} />
          {isEditing && (
            <div className={styles.controls}>
              <button onClick={handleChangeImage}>Change</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DisplayImage;
