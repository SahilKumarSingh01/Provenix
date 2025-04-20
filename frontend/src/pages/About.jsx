import React from 'react';
import {useNavigate } from 'react-router-dom';
import backgroundImg from '../assets/aboutBackground.png';
import styles from '../styles/AboutPage.module.css';

const AboutPage = () => {
  const navigate=useNavigate();
  return (
    <div className={styles.aboutContainer}>
      {/* Hero Section */}
      <section className={styles.aboutHero} style={{ backgroundImage: `linear-gradient(rgba(10, 25, 47, 0.9), rgba(10, 25, 47, 0.9)), url(${backgroundImg})` }}>
        <div className={styles.heroContent}>
          <h1>About Provenix</h1>
          <p>A platform for software developers to help each other learn programming languages.</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className={styles.missionSection}>
        <div className={styles.missionContent}>
          <h2>Our Mission</h2>
          <p>
            At Provenix, our mission is to create a platform where developers, regardless of experience, can share their knowledge of programming languages. 
            We aim to provide a space for both learning and teaching, where anyone can create a course, and learners can interact with content in new and engaging ways.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <h3>Create Courses</h3>
            <p>Anyone can create a course! You don't need to be an expert, but linking your GitHub, Leetcode, or Codeforces profiles helps prove authenticity.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>Interactive Learning</h3>
            <p>Engage with your courses by highlighting content, bookmarking videos, and solving MCQs for an active learning experience.</p>
          </div>
        </div>
      </section>

      {/* Stats Section
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <h4>10,000+</h4>
            <p>Active Learners</p>
          </div>
          <div className={styles.statItem}>
            <h4>500+</h4>
            <p>Course Creators</p>
          </div>
          <div className={styles.statItem}>
            <h4>100+</h4>
            <p>Courses Available</p>
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <h2>Join the Learning Revolution</h2>
        <div className={styles.ctaButtons}>
          <button className={`${styles.ctaBtn} ${styles.learnerCta}`} onClick={()=>{navigate('/explore')}}>Start Learning</button>
          <button className={`${styles.ctaBtn} ${styles.creatorCta}`} onClick={()=>{navigate('/course/create')}}>Create a Course</button>
        </div>
      </section>

      {/* About the Creators */}
      <section className={styles.creatorsSection}>
        <h2>About the Creators</h2>
        <p>Provenix is created by Sahil Kumar Singh and Akanksha Maurya, college students from Motilal Nehru National Institute of Technology, Allahabad, pursuing B.Tech in Computer Science Engineering (CSE).</p>
      </section>
    </div>
  );
};

export default AboutPage;
