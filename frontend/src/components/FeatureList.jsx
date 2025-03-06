// src/components/FeaturesList.jsx
import React from 'react';
import FeatureCard from './FeatureCard';
import { features } from '../assets/features';
import '../styles/FeaturesList.css';

const FeaturesList = () => {
  return (
    <section className="features">
      {features.map((feature, index) => (
        <FeatureCard
          key={index}
          icon={feature.icon}
          title={feature.title}
          description={feature.description}
        />
      ))}
    </section>
  );
};

export default FeaturesList;