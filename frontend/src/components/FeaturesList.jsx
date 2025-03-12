import React from 'react';
import FeatureCard from './FeatureCard';
import { features } from '../assets/features';
import styles from '../styles/FeaturesList.module.css';

const FeaturesList = () => {
  return (
    <section className={styles.features}>
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
