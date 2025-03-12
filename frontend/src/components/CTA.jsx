import React from 'react';
import Button from './Button';
import styles from '../styles/CTA.module.css';

const CTA = () => {
  return (
    <section className={styles.ctaSection}>
      <h2 className={styles.heading}>Start Your Learning Journey Today</h2>
      <p className={styles.subtext}>Join over 1 million learners worldwide</p>
      <Button variant="primary">Join for Free</Button>
    </section>
  );
};

export default CTA;
