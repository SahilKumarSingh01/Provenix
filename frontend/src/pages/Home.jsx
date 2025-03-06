// src/pages/HomePage.jsx
import React from 'react';
import Hero from '../components/Hero';
 import FeaturesList from '../components/FeaturesList';
 import CTA from '../components/CTA';
 import Footer from '../components/Footer';

const HomePage = () => {
  return (
    <div className="home-container">
      <Hero />
      <FeaturesList />
      <CTA />
      <Footer />
    </div>
  );
};

export default HomePage;