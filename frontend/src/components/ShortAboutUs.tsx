import React, { useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import "../styles/aboutUs.scss";

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
    dim: {
      opacity: 0.4,    // half‐faded
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: { duration: 0.6, ease: "easeIn" },
    },
};

const textVariants = {
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  hidden:  { opacity: 0, y: -10, transition: { duration: 0.5 } },
};

const bgVariants = {
  hidden:  { opacity: 0, scale: 0.8 },
  visible:{ opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeInOut" } },
};

const logoVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible:{ opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20, delay: 0.4 } },
};

const ShortAboutUs: React.FC = () => {
  const img1Ctrl  = useAnimation();
  const txt1Ctrl  = useAnimation();
  const img2Ctrl  = useAnimation();
  const bgCtrl    = useAnimation();
  const logoCtrl  = useAnimation();

  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    if (!inView) return;
    const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
  
    (async () => {
      // 1) show 1st image + text
      await img1Ctrl.start("visible");
      await txt1Ctrl.start("visible");
      await delay(800);
  
      // 2) fade out 1st text completely
      await txt1Ctrl.start("hidden");
      await delay(200);
  
      // 3) dim 1st image (keep it half‐faded)
      await img1Ctrl.start("dim");
      await delay(400);
  
      // 4) show 2nd image
      await img2Ctrl.start("visible");
      await delay(800);
  
      // 5) exit both items
      await Promise.all([
        img1Ctrl.start("exit"),
        img2Ctrl.start("exit"),
      ]);
      await delay(200);
  
      // 6) show background
      await bgCtrl.start("visible");
      await delay(300);
  
      // 7) show logo + text
      await logoCtrl.start("visible");
    })();
  }, [inView, img1Ctrl, txt1Ctrl, img2Ctrl, bgCtrl, logoCtrl]);
  

  return (
    <motion.section
      ref={ref}
      className="s-about-section"
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{ hidden: {}, visible: {} }}
    >
      <div className="s-about-content">
        <h2 className="s-about-us-header">
          Saudi Made <br /> World Inspired
        </h2>
        <p className="arabic-text">
          .انطلاقًا من التراث الغني لشبه الجزيرة العربية، نربط التقاليد الخالدة بالابتكار المتطور
        </p>

        <div className="saudi-made-row">
          <div className="empty-col" />

          <div className="animation-col">
            {/* 1st item */}
            <motion.div
              className="saudi-made-item"
              variants={itemVariants}
              initial="hidden"
              animate={img1Ctrl}
            >
              <img
                src="/resources.svg"
                alt="Abundant Resources"
                className="saudi-made-image"
              />
              <motion.h3
                className="saudi-made-text"
                variants={textVariants}
                initial="hidden"
                animate={txt1Ctrl}
              >
                Abundant Resources
              </motion.h3>
            </motion.div>

            {/* 2nd item */}
            <motion.div
              className="saudi-made-item"
              variants={itemVariants}
              initial="hidden"
              animate={img2Ctrl}
            >
              <img
                src="/forward.svg"
                alt="Driven Forward"
                className="saudi-made-image"
              />
              <h3 className="saudi-made-text">Driven Forward</h3>
            </motion.div>

            {/* background + logo */}
            <motion.div
              className="saudi-made-bg"
              variants={bgVariants}
              initial="hidden"
              animate={bgCtrl}
            >
              <motion.div
                className="logo-layer"
                variants={logoVariants}
                initial="hidden"
                animate={logoCtrl}
              >
                <img
                  src="/full-saudi-made-logo.svg"
                  alt="Saudi Made Logo"
                  className="saudi-made-image"
                />
              </motion.div>
            </motion.div>
          </div>

          <div className="empty-col" />
        </div>
      </div>
    </motion.section>
  );
};

export default ShortAboutUs;
