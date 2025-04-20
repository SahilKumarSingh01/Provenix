// src/components/FeaturesList.jsx
import React from 'react';
import FeatureCard from './FeatureCard';
import styles from '../styles/FeaturesList.module.css';

const features = [
  {
    icon: '💡',
    title: 'Real-World Learning',
    description: 'Learn coding directly from developers. Practical lessons, not just theory.'
  },
  {
    icon: '🌍',
    title: 'Global Community',
    description: 'Engage with learners and creators from all over the world. Share insights, ideas, and feedback.'
  },
  {
    icon: '🔗',
    title: 'Interactive Features',
    description: 'Engage with videos, quizzes, and interactive coding challenges to reinforce your learning.'
  },
  {
    icon: '🗣️',
    title: 'Mentorship & Collaboration',
    description: 'Collaborate with fellow learners, ask questions, and get feedback to enhance your learning journey.'
  },
  {
    icon: '🚀',
    title: 'Progress Tracking',
    description: 'Track your learning journey and see real-time progress with stats and achievements.'
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
