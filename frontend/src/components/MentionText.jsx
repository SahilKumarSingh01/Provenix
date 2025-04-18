import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import styles from '../styles/MentionText.module.css';

const MentionText = ({ text }) => {
  const mentionRegex = /@(\w+)/g;
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const charLimit = 200;

  const handleMentionClick = (username, e) => {
    e.stopPropagation();
    navigate(`/profile/${username}`);
  };

  // Split and highlight mentions
  const processText = (displayText) => {
    const parts = [];
    let lastIndex = 0;

    displayText.replace(mentionRegex, (match, username, index) => {
      if (index > lastIndex) {
        parts.push(displayText.slice(lastIndex, index));
      }

      parts.push(
        <span
          key={index}
          className={styles.mention}
          onClick={(e) => handleMentionClick(username, e)}
        >
          @{username}
        </span>
      );

      lastIndex = index + match.length;
      return match;
    });

    if (lastIndex < displayText.length) {
      parts.push(displayText.slice(lastIndex));
    }

    return parts;
  };

  const isLong = text.length > charLimit;
  const displayText = expanded || !isLong ? text : text.slice(0, charLimit) + '...';

  return (
    <div className={styles.container}>
      <pre className={styles.text}>{processText(displayText)}</pre>
      {isLong && (
        <button
          className={styles.toggleButton}
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          {expanded ? "Show Less ▲" : "Load More ▼"}
        </button>
      )}
    </div>
  );
};

export default MentionText;
