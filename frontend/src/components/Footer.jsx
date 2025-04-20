import React from 'react';
import styles from '../styles/Footer.module.css';
import {Link} from 'react-router-dom'
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
          <Link to="/explore" className={styles.link}>Courses</Link>
          <Link
            to="#"
            className={styles.link}
            onClick={(e) => {
              e.preventDefault();
              window.location.href = "mailto:provenixcreator@gmail.com";
            }}
          >
            Support
          </Link>          
          <Link to="/about" className={styles.link}>About</Link>
        </div>
        <div className={styles.footerSection}>
          <h4>Contact</h4>
          <p>provenixcreator@gmail.com</p>
          {/* <p>+1 (555) 123-4567</p> */}
        </div>
      </div>
      <div className={styles.footerBottom}>
        <p>© 2025 Provenix. Connecting learners with expert instructors worldwide.</p>
      </div>
    </footer>
  );
};

export default Footer;
