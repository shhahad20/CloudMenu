import { motion, useTransform, useScroll } from "framer-motion";
import "../styles/tabletScroll.scss";
import { useRef } from "react";
const AnimatedSVG = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Animation transforms
  const rotateX = useTransform(scrollYProgress, [0, 1], [15, -15]);
  const rotateZ = useTransform(scrollYProgress, [0, 1], [-3, 3]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const translateY = useTransform(scrollYProgress, [0, 1], ["20%", "-20%"]);

  return (
    <div className="tablet-container" ref={containerRef}>
      <motion.div
        className="img-wrapper"
        style={{
          perspective: 1000,
          scale,
        }}
      >
        <motion.img
          src="https://assets.website-files.com/5f6defc193852768e5fc2dab/60c8b3724c66fb10901fcab9_ipad-pro.svg"
          alt="Animated iPad Pro"
          style={{
            rotateX,
            rotateZ,
            translateY,
            transformStyle: "preserve-3d",
          }}
          className="tablet-frame"
        />
        <div className="inner-content">
          <img src="/menuu.jpg" alt="Inner Content" />
        </div>
      </motion.div>
    </div>
  );
};

export default AnimatedSVG;
