// src/components/Footer.jsx
import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Provenix</h4>
          <p>Empowering learners and educators worldwide</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <a href="#courses">Courses</a>
          <a href="#teach">Teach</a>
          <a href="#about">About</a>
        </div>
        <div className="footer-section">
          <h4>Contact</h4>
          <p>support@provenix.com</p>
          <p>+1 (555) 123-4567</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2023 Provenix. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;