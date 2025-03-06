// src/components/CTA.jsx
import React from 'react';
import Button from './Button';
import '../styles/CTA.css';

const CTA = () => {
  return (
    <section className="cta-section">
      <h2>Start Your Learning Journey Today</h2>
      <p>Join over 1 million learners worldwide</p>
      <Button variant="primary">Join for Free</Button>
    </section>
  );
};

export default CTA;