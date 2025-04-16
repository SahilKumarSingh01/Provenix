import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import styles from "../styles/GitHubCard.module.css";

const GitHubCard = ({ username }) => {
  const [ghData, setGhData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGitHubData = async () => {
      try {
        const res = await axios.get("/api/profile/github", {
          params: { username },
        });
        setGhData(res.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch GitHub data");
      }
    };

    if (username) {
      fetchGitHubData();
    }
  }, [username]);

  if (error) {
      return (
        <div className={styles.card}>
        <h3 className={styles.cardTitle}>GitHub Profile</h3>
        <div className={styles.cardContent}>
          <div className={styles.errorText}>{error}</div>
        </div>
        </div>
      )
    }

  if (!ghData) {
    return <div className={styles.loadingText}>Loading GitHub data...</div>;
  }

  const {
    login,
    name,
    avatar_url,
    bio,
    location,
    public_repos,
    followers,
    following,
  } = ghData;

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>GitHub Profile</h3>
      <div className={styles.cardContent}>
        <img src={avatar_url} alt="Avatar" className={styles.avatar} />
        <div className={styles.userInfo}>
          <p><strong>Name:</strong> {name || "—"}</p>
          <p><strong>Username:</strong> {login}</p>
          <p><strong>Bio:</strong> {bio || "—"}</p>
          <p><strong>Location:</strong> {location || "—"}</p>
          <p>
            <strong>Public Repos:</strong>{" "}
            <span className={styles.highlightedValue}>{public_repos}</span>
          </p> 
         <p><strong>Followers:</strong> {followers}</p>
          <p><strong>Following:</strong> {following}</p>
        </div>
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.viewProfile}
        >
          View on GitHub
        </a>
      </div>
    </div>
  );
};

export default GitHubCard;
