// src/pages/HomePage.jsx
import React from 'react';
import Hero from '../components/Hero';
 import FeaturesList from '../components/FeaturesList';
 import Footer from '../components/Footer';

const HomePage = () => {
  return (
    <div className="home-container">
      <Hero />
      <FeaturesList />
      <Footer />
    </div>
  );
};

export default HomePage;