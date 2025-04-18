import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import styles from "../styles/CodeforcesCard.module.css";

const CodeforcesCard = ({ username ,isVerified}) => {
  const [cfData, setCfData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCodeforcesData = async () => {
      try {
        const res = await axios.get("/api/profile/codeforces", {
          params: { username },
        });
        setCfData(res.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch Codeforces data");
      }
    };

    if (username) {
      fetchCodeforcesData();
    }
  }, [username]);

  if (error) {
    return (
      <div className={styles.card}>
      <h3 className={styles.cardTitle}>Codeforces Profile</h3>
      <div className={styles.cardContent}>
        <div className={styles.errorText}>{error}</div>
      </div>
      </div>
    )
  }

  if (!cfData) {
    return <div className={styles.loadingText}>Loading Codeforces data...</div>;
  }

  const {
    handle,
    firstName,
    avatar,
    organization,
    rank,
    maxRank,
    rating,
    maxRating,
    contribution,
    friendOfCount,
  } = cfData;

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>Codeforces Profile{" "}{!isVerified&&<span className={styles.errorText}>(Not verified)</span>}</h3>
      <div className={styles.cardContent}>
        <img src={avatar} alt="Avatar" className={styles.avatar} />
        <div className={styles.userInfo}>
        <p><strong>Handle:</strong> {handle}</p>
        <p><strong>Name:</strong> {firstName || "—"}</p>
        <p><strong>Organization:</strong> {organization || "—"}</p>
        <p>
          <strong>Rank:</strong>{" "}
          <span className={styles.highlightedValue}>{rank}</span>
        </p>
        <p>
          <strong>Max Rank:</strong>{" "}
          <span className={styles.highlightedValue}>{maxRank}</span>
        </p>
        <p>
          <strong>Rating:</strong>{" "}
          <span className={styles.highlightedValue}>{rating}</span>
        </p>
        <p>
          <strong>Max Rating:</strong>{" "}
          <span className={styles.highlightedValue}>{maxRating}</span>
        </p>
        <p><strong>Contribution:</strong> {contribution}</p>
        <p><strong>Friends:</strong> {friendOfCount}</p>

        </div>
        <a
          href={`https://codeforces.com/profile/${handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.viewProfile}
        >
          View on Codeforces
        </a>
      </div>
    </div>
  );
};

export default CodeforcesCard;
