import React from 'react';
import FeatureCard from './FeatureCard';
import styles from '../styles/FeaturesList.module.css';
const features = [
  {
    icon: '📚',
    title: '1000+ Courses',
    description: 'From technology to arts, learn what you love'
  },
  {
    icon: '🎓',
    title: 'Expert Teachers',
    description: 'Learn from industry professionals and experts'
  },
  {
    icon: '💻',
    title: 'Interactive Learning',
    description: 'Engage with hands-on projects and quizzes'
  }
];
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
