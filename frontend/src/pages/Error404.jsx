import React from "react";
import styles from "../styles/Error404.module.css"; // Importing the CSS module
import Footer from "../components/Footer"; // Your existing footer component

const Error404 = () => {
  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorContent}>
        <div className={styles.errorNumber}>404</div>
        <div className={styles.errorText}>
          <h1 className={styles.errorHeading}>Page not found</h1>
          <p className={styles.errorMessage}>
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
          <a href="/" className={styles.homeLink}>
            ← Return to homepage
          </a>
        </div>
        <div className={styles.errorIllustration}>
          <div className={styles.octocat}>🐙</div> {/* You can replace this with an SVG if needed */}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Error404;
