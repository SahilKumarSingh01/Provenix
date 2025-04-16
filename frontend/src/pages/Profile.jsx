import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { toast } from "react-toastify";
import Error404 from "./Error404";
import styles from "../styles/Profile.module.css";

// Cards
import ProfileInfoCard from "../components/ProfileInfoCard.jsx";
import GitHubCard from "../components/GitHubCard.jsx";
import LeetCodeCard from "../components/LeetCodeCard.jsx";
import CodeforcesCard from "../components/CodeforcesCard.jsx";

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [showLeftPane, setShowLeftPane] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/api/profile/${username}`);
        setUser(res.data);
        setNotFound(false);
      } catch (err) {
        const errorMessage =
          err.response?.data?.error || "Failed to fetch profile";
        toast.error(errorMessage);
        setNotFound(true);
      }
    };

    fetchProfile();
  }, [username]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setShowLeftPane(true); // always show sidebar on desktop
      } else {
        setShowLeftPane(false); // default hidden on mobile
      }
    };

    handleResize(); // call once on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleEditRedirect = () => {
    navigate(`/edit-profile`);
  };

  if (notFound) {
    return <Error404 />;
  }

  if (!user) {
    return <div className={styles.loadingText}>Loading profile...</div>;
  }

  const codingProfiles = user.profile?.codingProfiles || {};
  // console.log(user);
  return (
      <div className={styles.profileContainer}>

        
        <div className={`${styles.leftPane} ${isMobile &&!showLeftPane ? styles.leftPaneHidden : ''}`}>
          <ProfileInfoCard
            displayName={user.displayName}
            username={user.username}
            photo={user.photo}
            bio={user.bio}
            codingProfiles={codingProfiles}
            onEdit={handleEditRedirect}
          />
        </div>
        {isMobile && (
          <button
            className={`${styles.toggleButton} ${showLeftPane ? styles.toggleShifted : ""}`}
            onClick={() => setShowLeftPane((prev) => !prev)}
          >
            {showLeftPane ? "⏴" : "⏵"}
          </button>
        )}
        <div className={styles.rightPane}>
          <div className={styles.platformCardsWrapper}>
            {codingProfiles.github?.username && (
              <div className={styles.platformCard}>
                <GitHubCard username={codingProfiles.github.username} />
              </div>
            )}
            {codingProfiles.codeforces?.username && (
              <div className={styles.platformCard}>
                <CodeforcesCard username={codingProfiles.codeforces.username} />
              </div>
            )}
          </div>

          {codingProfiles.leetcode?.username && (
            <LeetCodeCard username={codingProfiles.leetcode.username} />
          )}
        </div>

      </div>
    
  );
};

export default Profile;
