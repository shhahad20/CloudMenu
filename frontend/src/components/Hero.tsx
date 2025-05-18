import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

import "../styles/hero.scss";

const Hero: React.FC = () => {
  const headers = [
    "Welcome to Our Website!",
    "Discover Amazing Features",
    "Join Us Today",
    "Experience the Best",
  ];

  const [currentHeaderIndex, setCurrentHeaderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeaderIndex((prevIndex) => (prevIndex + 1) % headers.length);
    }, 5000);

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [headers.length]);

  return (
    <motion.div
      className="hero-container"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.2 }}
    >
      <p className="sub-heading">
        <motion.span
          key={currentHeaderIndex}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          {headers[currentHeaderIndex]}
        </motion.span>
      </p>
      <h1 className="hero-heading">Make Your Menu a Work of Art</h1>
      <div className="contact-btn-wrapper">
        <a href="#services">
        <button
          className="circle-arrow-btn"
        >
          <span className="btn-text">Our Services</span>
          <span className="icon-container">
            <span className="arrow">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </span>
        </button>
        </a>
      </div>
    </motion.div>
  );
};

export default Hero;
