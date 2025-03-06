// src/components/FeatureCard.jsx
import React from 'react';
import '../styles/FeatureCard.css';

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="feature-card">
      <h3>{icon} {title}</h3>
      <p>{description}</p>
    </div>
  );
};

export default FeatureCard;