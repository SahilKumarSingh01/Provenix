import React from 'react';
import styles from '../styles/PrivacyPolicy.module.css';

const PrivacyPolicy = () => {
  return (
    <div className={styles.privacyContainer}>
      <header className={styles.privacyHeader}>
        <h1>Privacy Policy</h1>
        <p className={styles.updateDate}>Last updated: [Insert Date]</p>
      </header>

      <main className={styles.privacyContent}>
        <section className={styles.policySection}>
          <h2 className={styles.sectionTitle}>Introduction</h2>
          <p>Welcome to [Your Platform Name], a learning platform connecting learners and mentors. We are committed to protecting your personal information and your right to privacy.</p>
        </section>

        <section className={styles.policySection}>
          <h2 className={styles.sectionTitle}>Data We Collect</h2>
          <div className={styles.dataTypes}>
            <div className={styles.dataCard}>
              <h3>Learner Information</h3>
              <ul>
                <li>Account registration details</li>
                <li>Course progress and preferences</li>
                <li>Payment information</li>
              </ul>
            </div>
            <div className={styles.dataCard}>
              <h3>Mentor Information</h3>
              <ul>
                <li>Professional credentials</li>
                <li>Teaching materials</li>
                <li>Student interaction data</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.policySection}>
          <h2 className={styles.sectionTitle}>How We Use Your Data</h2>
          <ul className={styles.usageList}>
            <li>➜ Personalize learning experiences</li>
            <li>➜ Facilitate mentor-student communication</li>
            <li>➜ Process payments securely</li>
            <li>➜ Improve platform functionality</li>
          </ul>
        </section>

        <section className={styles.policySection}>
          <h2 className={styles.sectionTitle}>Data Security</h2>
          <p>We implement:</p>
          <div className={styles.securityFeatures}>
            <div className={styles.securityCard}>
              <h3>Encryption</h3>
              <p>End-to-end data encryption</p>
            </div>
            <div className={styles.securityCard}>
              <h3>Access Control</h3>
              <p>Strict role-based access</p>
            </div>
          </div>
        </section>

        <section className={styles.policySection}>
          <h2 className={styles.sectionTitle}>Your Rights</h2>
          <div className={styles.rightsGrid}>
            <p>📋 Access your data</p>
            <p>✏️ Request corrections</p>
            <p>🗑️ Delete account</p>
            <p>🔒 Data portability</p>
          </div>
        </section>

        <div className={styles.contactSection}>
          <p>Contact us at <a href="mailto:privacy@example.com">privacy@example.com</a> for any questions.</p>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
