import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import styles from "../styles/LeetCodeCard.module.css";

const LeetCodeCard = ({ username }) => {
  const [leetCodeData, setLeetCodeData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeetCodeData = async () => {
      try {
        const res = await axios.get(`/api/profile/leetcode`, {
          params: { username },
        });
        setLeetCodeData(res.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch LeetCode data");
      }
    };

    if (username) {
      fetchLeetCodeData();
    }
  }, [username]);

  if (error) {
    return (
      <div className={styles.card}>
      <h3 className={styles.cardTitle}>LeetCode Profile</h3>
      <div className={styles.cardContent}>
        <div className={styles.errorText}>{error}</div>
      </div>
      </div>
    )
  }

  if (!leetCodeData) {
    return <div className={styles.loadingText}>Loading LeetCode data...</div>;
  }

  const {
    profile,
    questionsByDifficulty,
    totalQuestions,
    upcomingBadges,
    badges,
  } = leetCodeData;
  console.log(upcomingBadges);
  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>LeetCode Profile</h3>
      <div className={styles.cardContent}>
        <img src={profile.avatar} alt="Avatar" className={styles.avatar} />
        <div className={styles.twoColumnLayout}>
          <div className={styles.userInfo}>
            <p><strong>Name:</strong> {profile.realName}</p>
            <p><strong>Username:</strong> {profile.username}</p>
            <p><strong>Country:</strong> {profile.country}</p>
            <p><strong>Reputation:</strong> {profile.reputation}</p>
            <p><strong>Ranking:</strong> {profile.ranking}</p>
            <p><strong>Star Rating:</strong> {profile.starRating}</p>
            <p><strong>About:</strong> {profile.aboutMe || "—"}</p>
          </div>

          <div className={styles.problemStats}>
            <h4>Problems Solved:</h4>
            <ul className={styles.problemList}>
              {questionsByDifficulty.map((q) => {
                const total = totalQuestions.find(t => t.difficulty === q.difficulty)?.count || 0;

                return (
                  <li key={q.difficulty} className={styles.problemItem}>
                    <div className={styles.difficultyRow}>
                      <div
                        className={styles.donut}
                        style={{
                          background: `conic-gradient(
                            ${q.difficulty === "Easy" ? "#4caf50" :
                            q.difficulty === "Medium" ? "#ff9800" : "#f44336"}
                            ${Math.round((q.count / total) * 360)}deg,#2e3a59 0deg)`
                        }}
                      >
                        <div className={styles.donutInner}></div>
                      </div>
                      <span>{q.difficulty}: {q.count}/{total}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        {badges.length > 0 && (
          <>
            <h4>Badges:</h4>
            <div className={styles.badgeGrid}>
              <ul className={styles.badgeList}>
                {badges
                  .filter((_, index) => index % 2 === 0)
                  .map((badge) => (
                    <li key={badge.id} className={styles.badgeItem}>
                      {badge.displayName}
                    </li>
                  ))}
              </ul>
              <ul className={styles.badgeList}>
                {badges
                  .filter((_, index) => index % 2 !== 0)
                  .map((badge) => (
                    <li key={badge.id} className={styles.badgeItem}>
                      {badge.displayName}
                    </li>
                  ))}
              </ul>
            </div>
          </>
        )}

        <a
          href={`https://leetcode.com/${profile.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.viewProfile}
        >
          View on LeetCode
        </a>
      </div>
    </div>
  );
};

export default LeetCodeCard;
