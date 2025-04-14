import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import defaultPicture from "../assets/defaultPicture.png";

import styles from "../styles/Profile.module.css";

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/api/profile/${username}`);
        setUser(res.data);
        setError("");
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch profile");
        setUser(null);
      }
    };

    fetchProfile();
  }, [username]);

  const handleEditRedirect = () => {
    navigate(`/edit-profile`);
  };

  if (error) {
    return <div className={styles.errorText}>{error}</div>;
  }

  if (!user) {
    return <div className={styles.loadingText}>Loading profile...</div>;
  }

  const { photo, displayName, profile } = user;
  const codingProfiles = profile?.codingProfiles || {};

  return (
    <div className={styles.profileContainer}>
      {/* Header Section */}
      <div className={styles.profileHeader}>
        <img
          src={photo || defaultPicture}
          alt="User"
          className={styles.profilePhoto}
        />
        <div className={styles.userInfo}>
          <h2 className={styles.displayName}>{displayName || username}</h2>
          <p className={styles.username}>@{username}</p>
        </div>
      </div>

      {/* Coding Profiles Section */}
      {!!Object.keys(codingProfiles).length && (
        <div className={styles.codingProfiles}>
          <h3>Coding Profiles</h3>
          <ul className={styles.profileList}>
            {Object.entries(codingProfiles).map(([platform, details]) => {
              const capitalizedPlatform =
                platform.charAt(0).toUpperCase() + platform.slice(1);

              return (
                <li key={platform} className={styles.profileItem}>
                  <strong>{capitalizedPlatform}:</strong>{" "}
                  {details.url ? (
                    <a
                      href={details.url}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.profileLink}
                    >
                      {details.username}
                    </a>
                  ) : (
                    <span>Not linked</span>
                  )}
                  {details.isVerified && (
                    <span className={styles.verifiedBadge}>✔</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Edit Button */}
      <div className={styles.editButtons}>
        <button onClick={handleEditRedirect} className={styles.editButton}>
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default Profile;
