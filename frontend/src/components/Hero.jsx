// src/components/Hero.jsx
import React from 'react';
import Button from './Button';
import '../styles/Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Learn. Teach. Grow.</h1>
        <p className="hero-subtext">
          Join the revolution in online education. Learn new skills from expert instructors 
          or share your knowledge with the world.
        </p>
        <div className="hero-buttons">
          <Button variant="primary">Start Learning</Button>
          <Button variant="secondary">Become an Instructor</Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;