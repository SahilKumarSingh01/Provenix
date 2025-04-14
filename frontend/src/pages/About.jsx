import React from 'react';
import backgroundImg from '../assets/aboutBackground.png'
import styles from '../styles/AboutPage.module.css';

const AboutPage = () => {
  return (
    <div className={styles.aboutContainer}>
      {/* Hero Section */}
      <section className={styles.aboutHero}style={{backgroundImage:`linear-gradient(rgba(10, 25, 47, 0.9), rgba(10, 25, 47, 0.9)), url(${backgroundImg})`}}>
        <div className={styles.heroContent}>
          <h1>About Provenix</h1>
          <p>Empowering learners and educators through innovative digital education</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className={styles.missionSection}>
        <div className={styles.missionContent}>
          <h2>Our Mission</h2>
          <p>
            Provenix is dedicated to bridging the gap between passionate learners and 
            expert educators. We provide a seamless platform where knowledge meets 
            curiosity, and learning becomes an enjoyable journey for everyone.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <h3>For Learners</h3>
            <p>Access curated courses, interactive learning materials, and expert guidance</p>
          </div>
          <div className={styles.featureCard}>
            <h3>For Educators</h3>
            <p>Share your knowledge with a global audience and manage your courses effectively</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <h4>10,000+</h4>
            <p>Active Learners</p>
          </div>
          <div className={styles.statItem}>
            <h4>500+</h4>
            <p>Expert Educators</p>
          </div>
          <div className={styles.statItem}>
            <h4>100+</h4>
            <p>Courses Available</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <h2>Join the Learning Revolution</h2>
        <div className={styles.ctaButtons}>
          <button className={`${styles.ctaBtn} ${styles.learnerCta}`}>Start Learning</button>
          <button className={`${styles.ctaBtn} ${styles.educatorCta}`}>Teach with Us</button>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
