// PrivacyPolicy.js
import React from 'react';
import '../styles/PrivacyPolicy.css'; // Your global CSS

const PrivacyPolicy = () => {
  return (
    <div className="privacy-container">
      <header className="privacy-header">
        <h1>Privacy Policy</h1>
        <p className="update-date">Last updated: [Insert Date]</p>
      </header>

      <main className="privacy-content">
        <section className="policy-section">
          <h2 className="section-title">Introduction</h2>
          <p>Welcome to [Your Platform Name], a learning platform connecting learners and mentors. We are committed to protecting your personal information and your right to privacy.</p>
        </section>

        <section className="policy-section">
          <h2 className="section-title">Data We Collect</h2>
          <div className="data-types">
            <div className="data-card">
              <h3>Learner Information</h3>
              <ul>
                <li>Account registration details</li>
                <li>Course progress and preferences</li>
                <li>Payment information</li>
              </ul>
            </div>
            <div className="data-card">
              <h3>Mentor Information</h3>
              <ul>
                <li>Professional credentials</li>
                <li>Teaching materials</li>
                <li>Student interaction data</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="policy-section">
          <h2 className="section-title">How We Use Your Data</h2>
          <ul className="usage-list">
            <li>➜ Personalize learning experiences</li>
            <li>➜ Facilitate mentor-student communication</li>
            <li>➜ Process payments securely</li>
            <li>➜ Improve platform functionality</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2 className="section-title">Data Security</h2>
          <p>We implement:</p>
          <div className="security-features">
            <div className="security-card">
              <h3>Encryption</h3>
              <p>End-to-end data encryption</p>
            </div>
            <div className="security-card">
              <h3>Access Control</h3>
              <p>Strict role-based access</p>
            </div>
          </div>
        </section>

        <section className="policy-section">
          <h2 className="section-title">Your Rights</h2>
          <div className="rights-grid">
            <p>📋 Access your data</p>
            <p>✏️ Request corrections</p>
            <p>🗑️ Delete account</p>
            <p>🔒 Data portability</p>
          </div>
        </section>

        <div className="contact-section">
          <p>Contact us at <a href="mailto:privacy@example.com">privacy@example.com</a> for any questions.</p>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;