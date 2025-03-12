// src/components/Hero.jsx
import React from 'react';
import Button from './Button';
import styles from '../styles/Hero.module.css';

const Hero = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <h1>Learn. Teach. Grow.</h1>
        <p className={styles.heroSubtext}>
          Join the revolution in online education. Learn new skills from expert instructors 
          or share your knowledge with the world.
        </p>
        <div className={styles.heroButtons}>
          <Button variant="primary">Start Learning</Button>
          <Button variant="secondary">Become an Instructor</Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
