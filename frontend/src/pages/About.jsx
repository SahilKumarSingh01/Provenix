import React from 'react';
import '../styles/about.css';

const AboutPage = () => {
  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-content">
          <h1>About Provenix</h1>
          <p>Empowering learners and educators through innovative digital education</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="mission-content">
          <h2>Our Mission</h2>
          <p>
            Provenix is dedicated to bridging the gap between passionate learners and 
            expert educators. We provide a seamless platform where knowledge meets 
            curiosity, and learning becomes an enjoyable journey for everyone.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <h3>For Learners</h3>
            <p>Access curated courses, interactive learning materials, and expert guidance</p>
          </div>
          <div className="feature-card">
            <h3>For Educators</h3>
            <p>Share your knowledge with a global audience and manage your courses effectively</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <h4>10,000+</h4>
            <p>Active Learners</p>
          </div>
          <div className="stat-item">
            <h4>500+</h4>
            <p>Expert Educators</p>
          </div>
          <div className="stat-item">
            <h4>100+</h4>
            <p>Courses Available</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Join the Learning Revolution</h2>
        <div className="cta-buttons">
          <button className="cta-btn learner-cta">Start Learning</button>
          <button className="cta-btn educator-cta">Teach with Us</button>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;