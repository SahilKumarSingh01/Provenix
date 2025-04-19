import React from 'react';
import styles from '../styles/Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h4>Provenix</h4>
          <p>Empowering learners and educators worldwide</p>
        </div>
        <div className={styles.footerSection}>
          <h4>Quick Links</h4>
          <a href="#courses" className={styles.link}>Courses</a>
          <a href="#teach" className={styles.link}>Teach</a>
          <a href="#about" className={styles.link}>About</a>
        </div>
        <div className={styles.footerSection}>
          <h4>Contact</h4>
          <p>provenixcreator@gmail.com</p>
          {/* <p>+1 (555) 123-4567</p> */}
        </div>
      </div>
      <div className={styles.footerBottom}>
        <p>© 2025 Provenix. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
