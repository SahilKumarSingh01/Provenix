// src/components/Hero.jsx
import React from 'react';
import {useNavigate } from 'react-router-dom';

import styles from '../styles/Hero.module.css';

const Hero = () => {
  const navigate=useNavigate();
  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <h1>Code. Share. Empower.</h1>
        <p className={styles.heroSubtext}>
          Provenix is where devs grow — learn from real coders, or teach and inspire others. Build your profile, 
          share your skills, and become part of a community that codes together.
        </p>
        <div className={styles.heroButtons}>
          <button className={`${styles.btn} ${styles.primary}`} onClick={()=>{navigate('/explore')}}>Start Learning</button>
          <button className={`${styles.btn} ${styles.secondary}`} onClick={()=>{navigate('/course/create')}}>Create a Course</button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
