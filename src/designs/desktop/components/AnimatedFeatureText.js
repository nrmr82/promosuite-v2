import React, { useState, useEffect } from 'react';
import './AnimatedFeatureText.css';

const AnimatedFeatureText = () => {
  const features = [
    { text: "AI-Powered", color: "gradient-ai" },
    { text: "10x Faster", color: "gradient-speed" },
    { text: "Professional", color: "gradient-pro" },
    { text: "Real Estate Focused", color: "gradient-estate" },
    { text: "Template-Rich", color: "gradient-template" },
    { text: "Brand Consistent", color: "gradient-brand" }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % features.length);
        setIsAnimating(false);
      }, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <span className="animated-feature-container">
      <span className={`animated-feature ${features[currentIndex].color} ${isAnimating ? 'fade-out' : 'fade-in'}`}>
        {features[currentIndex].text}
      </span>
    </span>
  );
};

export default AnimatedFeatureText;
