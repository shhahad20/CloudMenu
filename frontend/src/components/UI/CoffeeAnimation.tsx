import React from "react";
import { motion } from "framer-motion";
import "../../styles/coffeeAnimation.scss";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.25, // Stagger each child by 0.25s
        when: "beforeChildren",
      },
    },
  };
  
  // Variant for the header ("Cappuccino")
  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };
  
  // Variant for the cappuccino image
  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8, rotate: -10 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      rotate: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };
  
  // Variant for each ingredient chip
  const chipVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };
  
  // Variant for the subheader ("Latte")
  const subHeaderVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  
const CoffeeAnimation: React.FC = () => {
    return (
      <motion.div
        className="coffee-overlay"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.h2 className="coffee-header" variants={headerVariants}>Cappuccino</motion.h2>
        <motion.img
          src="/cappuccino.svg"
          alt="Cappuccino"
          className="cappuccino-image"
          variants={imageVariants}

        />
  
        <div className="ingredient-row">
          <motion.div className="ingredient-chip espresso" variants={chipVariants}>Espresso</motion.div>
          <motion.div className="ingredient-chip steamed-milk" variants={chipVariants}>Steamed Milk</motion.div>
          <motion.div className="ingredient-chip foam" variants={chipVariants}>Foam</motion.div>
        </div>
  
        <motion.h3 className="coffee-sub" variants={subHeaderVariants}>Latte</motion.h3>
      </motion.div>
    );
  };

export default CoffeeAnimation;
