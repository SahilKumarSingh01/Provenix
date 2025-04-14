import React, { useEffect, useState ,useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "../api/axios";
import styles from "../styles/ProfileEditor.module.css";
import ImageUploader from "../components/ImageUploader";
import defaultProfile from "../assets/defaultPicture.png";
import { AuthContext } from "../context/AuthContext.jsx";
import ConfirmBox from "../components/confirmBox.jsx";


const platformSections = {
  leetcode: "About Me",
  github: "Bio",
  codeforces: "Bio",
};

const ProfileEditor = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [overlay, setOverlay] = useState(null);
  const {fetchUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get("/api/profile/my-profile");
        const mergedData = {
          ...data.profile,
          username: data.username,
          displayName: data.displayName,
          bio:data.bio,
          email: data.email,
          verifiedEmail: data.verifiedEmail,
          photo: data.photo,
          status:data.status,
        };
        console.log(data);
        setProfile(mergedData);
      } catch (err) {
        toast.error("Failed to load profile 😿");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadClick = () => {
    setOverlay(
      <ImageUploader
        onCancel={() => setOverlay(null)}
        onUpload={handleUpload}
        aspect={1}
      />
    );
  };

  const handleUpload = async (image) => {
    try {
      const formData = new FormData();
      formData.append("file", image);
      const { data } = await axios.post("/api/upload/profile", formData,{headers: {"content-type": "multipart/form-data"}});
      setProfile((prev) => ({ ...prev, photo: data.url }));
      toast.success("Photo uploaded successfully");
      setOverlay(null);
    } catch (err) {
      console.log(err);
      toast.error("Upload failed ");
    }
  };

  const handleDelete=()=>{
      const onConfirm = async () => {
        try {
          const { data } = await axios.post(`/api/profile/generate-token`);
          toast.success("Deletion link sent to your email ");
          setOverlay(null);
        } catch (err) {
          console.error(err);
          toast.error(err.response?.data?.message || "Failed to initiate deletion");
        }
      };
    
      setOverlay(
        <ConfirmBox
          onConfirm={onConfirm}
          onCancel={() => setOverlay(null)}
          message={`⚠️ Are you absolutely sure you want to delete your Provenix account?
    
    - You will lose access to your account and all your created content (courses, posts, bookmarks, etc.)
    - Your comments and reviews will remain, but your name will be hidden.
    - Any of your courses will be permanently removed after 1 hours of last enrollment expiration.
    - This action is irreversible.
    
    If you proceed, we'll send a special deletion link to your registered email. Click "Confirm" to continue.`}
        />
      );
    
  }
  const handleRecover = async () => {
    try {
      const { data } = await axios.post("/api/profile/recover-account");
      toast.success(data.message || "Account recovered ");
  
      const updatedProfile = { ...profile, status: "active" };
      setProfile(updatedProfile); // Assuming you're using this to re-render UI
      fetchUser();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to recover account");
    }
  };
  

  const handleVerify=async(platform)=>{
    const section = platformSections[platform] || "profile description";
    const hashCode = profile?.codingProfiles?.[platform]?.hashCode;
    navigator.clipboard.writeText(hashCode);
    const onConfirm=async()=>{
      try {
        const { data } = await axios.put(`/api/profile/verify/${platform}`) 
        const updatedProfile={...profile};
        updatedProfile.codingProfiles[platform].isVerified=true;
        setProfile(updatedProfile);
        toast.success(data.message);
        setOverlay(null);
      } catch (err) {
        console.log(err);
        toast.error(err.response.data?.message||"Profile update fail");
      }
    }
    setOverlay((<ConfirmBox 
            onConfirm={onConfirm} 
            onCancel={()=>{setOverlay(null)}}
            message={`HashCode copied to clipboard. Update the "${section}" 
            section of your ${platform} profile with this code to verify. Once done, click Confirm.`}
    />));
  }

  const handleUpdate=async(platform)=>{
    try {
      const { data } = await axios.put("/api/profile/set", {platform,url:profile.codingProfiles[platform].url}) // Send profile fields
      const updatedProfile={...profile};
      updatedProfile.codingProfiles[platform].username=data.username;
      updatedProfile.codingProfiles[platform].hashCode=data.hashCode;
      setProfile(updatedProfile);
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response.data?.message||"Profile update fail");
    }
  }
  
  const handleInputChange=async(platform,type,value)=>{
    const updatedProfile={...profile};
    updatedProfile.codingProfiles[platform][type]=value;
    setProfile(updatedProfile);
  }
  const handleSetDefault = () => {
    setProfile((prev) => ({ ...prev, photo: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { username, photo, displayName, email, bio } = profile;
      const { data } = await axios.put("/api/profile/update-my-profile", { username, photo, displayName, email, bio }); // Send profile fields
      fetchUser();
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response.data?.message||"Profile update fail");
    }
  };

  if (loading) return <p>Loading profile... ⏳</p>;
  if (!profile) return <p>No profile data found </p>;

  return (
    <div className={styles.profileContainer}>
      {overlay}
      <h2 className={styles.heading}>Profile Detail Form</h2>
      <form onSubmit={handleSubmit} className={styles.profileForm}>
        <div className={styles.formGroup}>
          <div className={styles.photoPreview}>
            <img src={profile.photo || defaultProfile} alt="Profile" />
          </div>
          <div className={styles.photoGroup}>
            <button type="button" onClick={handleSetDefault} className={styles.actionButton}>
              Set Default
            </button>
            <button type="button" onClick={handleUploadClick} className={styles.actionButton}>
              Upload
            </button>
          </div>
        </div>

        <div className={styles.formGroupWrapper}>
          <div className={styles.formGroup}>
            <label>Username:</label>
            <input name="username" value={profile.username} onChange={handleChange}/>
          </div>
          <div className={styles.formGroup}>
            <label>Display Name:</label>
            <input name="displayName" value={profile.displayName || ""} onChange={handleChange}/>
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label>Bio:</label>
          <textarea
            name="bio"
            value={profile.bio || ""}
            rows="4"
            onChange={handleChange}
          />
        </div>
        <br/>
        <CodingProfileInput
          platform="leetcode"
          label="LeetCode Profile"
          profile={profile}
          onInputChange={handleInputChange}
          onUpdate={handleUpdate}
          onVerify={handleVerify}
        />

        <CodingProfileInput
          platform="codeforces"
          label="Codeforces Profile"
          profile={profile}
          onInputChange={handleInputChange}
          onUpdate={handleUpdate}
          onVerify={handleVerify}
        />

        <CodingProfileInput
          platform="github"
          label="GitHub Profile"
          profile={profile}
          onInputChange={handleInputChange}
          onUpdate={handleUpdate}
          onVerify={handleVerify}
        />

      <br/>
      <div className={styles.formGroupWrapper}>
        <div className={styles.formGroup}>
          <label>Email:</label>
          <div className={styles.inputButtonWrapper}>
            <input name="email" value={profile.email} onChange={handleChange} />
            <button
              type="button"
              onClick={() => {
                if (!profile.verifiedEmail) {
                  navigate("/email-verify", { state: { email:profile.email } });
                }
              }}
              className={styles.actionButton}
              disabled={profile.verifiedEmail}
            >
              {profile.verifiedEmail ? "Verified" : "Verify"}
            </button>
          </div>
        </div>
        <div className={styles.formGroup}>
          <label>Account ID:</label>
          <div className={styles.inputButtonWrapper}>
            <input value={profile.accountId || ""} disabled/>
            <button
              type="button"
              onClick={() => {
                window.location.href = "/generate-account-id";
              }}
              className={styles.actionButton}
            >
              Generate
            </button>
          </div>
        </div>
      </div>

      <br/>
      <div className={styles.buttonGroup}>
        {profile?.status === "deleted" ? (
          <button type="button" className={styles.actionButton} onClick={handleRecover}>
            Recover
          </button>
        ) : (
          <button type="button" className={styles.deleteBtn} onClick={handleDelete}>
            Delete
          </button>
        )}


        <div className={styles.actionGroup}>
          <button 
            type="button" 
            className={styles.actionButton} 
            onClick={()=>navigate("/forgot-password",{ state: {email:profile.email} })}
          >
            Change Password
          </button>
          <button type="submit" className={styles.saveButton}>
            Update
          </button>
        </div>
      </div>

      </form>
    </div>
  );
};

export default ProfileEditor;

const CodingProfileInput = ({
  platform,
  label,
  profile,
  onInputChange,
  onUpdate,
  onVerify,
}) => {
  const data = profile.codingProfiles[platform];

  return (
    <div className={styles.formGroup}>
      <label>{label}</label>
      <div className={styles.inputButtonWrapper}>
        <input
          type="text"
          value={data.url}
          onChange={(e) => onInputChange(platform, "url",e.target.value)}
          placeholder={`Enter ${label} URL`}
        />
        <input
          type="text"
          value={data.username}
          readOnly
          placeholder="Username"
        />
        <input
          type="text"
          value={data.hashCode}
          readOnly
          placeholder="HashCode"
        />
        <div className={styles.buttonGroup}>

          <button
            type="button"
            onClick={() => onUpdate(platform)}
            className={styles.actionButton}
          >
            Update
          </button>
          <button
            type="button"
            onClick={() => onVerify(platform)}
            className={styles.actionButton}
            disabled={data.isVerified ||!data.hashCode}
          >
            {data.isVerified ? "Verified" : "Verify"}
          </button>
        </div>
      </div>
    </div>
  );
}
