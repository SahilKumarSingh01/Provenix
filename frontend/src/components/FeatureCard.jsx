import React from 'react';
import styles from '../styles/FeatureCard.module.css';

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className={styles.featureCard}>
      <h3>{icon} {title}</h3>
      <p>{description}</p>
    </div>
  );
};

export default FeatureCard;
