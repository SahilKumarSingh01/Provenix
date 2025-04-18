import React, {useContext} from "react";
import defaultPicture from "../assets/defaultPicture.png";
import styles from "../styles/ProfileInfoCard.module.css";
import { AuthContext } from "../context/AuthContext";

const ProfileInfoCard = ({
  username,
  displayName,
  photo,
  bio,
  codingProfiles = {},
  onEdit, // optional prop for edit
}) => {
  const { user } = useContext(AuthContext);
  
  const handleLinkClick = (url) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className={styles.card}>
      {/* Header with photo and name */}
      <div className={styles.header}>
        <img
            src={photo || defaultPicture}
            alt="User"
            className={styles.profilePhoto}
        />
        <div className={styles.userInfo}>
            <h2 className={styles.displayName} data-text={displayName}>
            {displayName}
            </h2>
            <p className={styles.username} data-text={username}>@{username}</p>
        </div>
      </div>
      {/* Edit Button */}
      {user?.username==username&&(<div className={styles.editButtons}>
        <button className={styles.editButton} onClick={onEdit}>
          Edit Profile
        </button>
      </div>
      )}
      {/* Bio Section (optional but styled like GitHub) */}
      {bio && (
        <div className={styles.bioSection}>
          <p className={styles.bioText}>{bio}</p>
        </div>
      )}

      {/* Coding Profiles */}
      {!!Object.keys(codingProfiles).length && (
        <>
          <h3 className={styles.sectionHeading}>Coding Profiles</h3>
          <ul className={styles.profileList}>
            {Object.entries(codingProfiles).map(([platform, details]) => {
              return (
                <li key={platform} className={styles.profileItem}>
                  <strong>{platform}:</strong>{" "}
                  <br/>
                  <div className={styles.profileLinkWrapper}>
                    {details.url ? (
                      <>
                      <span className={styles.profileLink} onClick={() => handleLinkClick(details.url)}>{details.username}</span>
                      {details.isVerified ? (
                          <span className={styles.verifiedBadge}>✔</span>
                        ):(
                          <span className={styles.unverifiedBadge}>unverified</span>
                        )
                      }
                      </>
                    ) : (
                      <span className={styles.unlinked}>Not linked</span>
                    )}
                    
                  </div>
                </li>
                
              );
            })}
          </ul>
        </>
      )}

      
    </div>
  );
};

export default ProfileInfoCard;
