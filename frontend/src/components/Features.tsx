import React from "react";
import { motion } from "framer-motion";
import CoffeeAnimation from "./UI/CoffeeAnimation";

import "../styles/features.scss";
const analyticsContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.3, // animate each bar one after the other
      delayChildren: 0.2,
    },
  },
};

const barVariants = (finalHeight: number, duration = 1.5) => ({
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: finalHeight,
    transition: { duration },
  },
});
const phoneContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { when: "beforeChildren", staggerChildren: 0.25 },
  },
};

const containerVariant = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

// Basic variant for the circle shape
const shapeVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5 },
  },
};

/*
    Updated arrow variant.
    The arrow first starts at (0,0) – matching the center of the circle,
    then moves to (60,100) – approximating the position of rectangle 3,
    and finally goes to (0,240) – matching the position of the out-rectangle.
    
    Adjust these numbers (x and y arrays) as needed to match your exact design layout.
  */
const arrowMovementVariant = {
  hidden: { x: 0, y: 0, scale: 1 },
  visible: {
    // Duplicate each position so that there is a moment to "click"
    x: [0, 0, 60, 60, 10, 10, 0, 0],
    y: [0, 0, 100, 100, 130, 130, 0, 0],
    // Scale goes down to 0.8 at the duplicate keyframes
    scale: [1, 0.8, 1, 0.8, 1, 0.8, 1, 1],
    transition: {
      duration: 4, // Total animation duration
      ease: "easeInOut",
      // Define the normalized timeline for each of the 8 keyframes
      times: [0, 0.125, 0.375, 0.5, 0.75, 0.875, 0.98, 1],
    },
  },
};

// Variant for the small rectangles (entering from left)
const rectangleVariant = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4 },
  },
};

// Variant for the larger bottom rectangle (entering from below)
const outRectangleVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.6 },
  },
};

const Features: React.FC = () => {
  return (
    <section className="features-section">
      <div className="features-header">
        <div className="features-dot-title">
          <span className="dot">•</span> FEATURES
        </div>
        <h2 className="features-slogan">
          Discover Our <br /> Exceptional Features
        </h2>
      </div>
      <div className="features-flex">
        <div className="box box2">
          <div className="header-description">
            <h3>SEO Optimized</h3>
            <p>
              Increase your online visibility and attract more customers with
              our SEO-optimized features.
            </p>
          </div>
          <motion.div
            className="analytics"
            variants={analyticsContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
          >
            <motion.div
              className="shape1"
              variants={barVariants(30, 1.5)} // final height in px, duration
            />
            <motion.div className="shape2" variants={barVariants(90, 2.0)} />
            <motion.div className="shape3" variants={barVariants(140, 2.5)} />
            <motion.div className="shape4" variants={barVariants(180, 3.0)} />
          </motion.div>
        </div>
        <div className="box box1">
          <div className="header-description">
            <h3>Mobile-Friendly</h3>
            <p>
              Responsive designs ensure that your menu looks stunning and
              functions seamlessly on any device
            </p>
            <div className="image-container1">
              <img
                src="/feat-img.svg"
                alt="Mobile-Friendly"
                className="feature-img1"
              />
            </div>
          </div>
          <div className="image-container">
            <motion.div
              className="phone-container"
              variants={phoneContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <img
                src="/iphone-feat1.svg"
                alt="Mobile-Friendly"
                className="feature-img2"
              />
              <CoffeeAnimation />
            </motion.div>
          </div>
        </div>
        <div className="box box3">
          <div className="header-description">
            <h3>Reflect Your Unique Identity</h3>
            <p>
              With our extensive customization options, you can tailor every
              aspect of your menu’s design and layout.
            </p>
          </div>
          <motion.div
            className="star-conatiner"
            initial={{ opacity: 0, scale: 0, rotate: -45 }}
            whileInView={{
              opacity: 1,
              scale: 1,
              rotate: 0,
            }}
            whileHover={{ scale: 1.1 }}
            transition={{
              duration: 0.8,
              type: "spring",
              stiffness: 150,
            }}
            viewport={{ once: true }}
          >
            <motion.img
              className="star"
              src="/Star.svg"
              alt="Star"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              whileHover={{ scale: 1.2 }}
              transition={{
                delay: 0.2,
                type: "spring",
                stiffness: 300,
              }}
            />
          </motion.div>
        </div>
        <div className="box box4">
          <div className="header-description">
            <h3>Never Been Easier!</h3>
            <p>
              Our platform allows you to design and modify your menu in just a
              few clicks.
            </p>
          </div>
          <motion.div
            className="shapes-container"
            variants={containerVariant}
            initial="hidden"
            animate="visible"
            viewport={{ once: true, amount: 0.5 }}
          >
            <motion.div
              className="shape1"
              variants={shapeVariants}
            ></motion.div>
            <motion.div className="shape2" variants={arrowMovementVariant}>
              <motion.img src="/feature-arrow.svg" alt="Arrow" />
            </motion.div>
            <motion.div
              className="shape3 rectangles"
              variants={containerVariant}
            >
              <motion.div
                className="rectangle1"
                variants={rectangleVariant}
              ></motion.div>
              <motion.div
                className="rectangle2"
                variants={rectangleVariant}
              ></motion.div>
              <motion.div
                className="rectangle3"
                variants={rectangleVariant}
              ></motion.div>
            </motion.div>
            <motion.div
              className="out-rectangle"
              variants={outRectangleVariant}
            ></motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Features;
