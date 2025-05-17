import React, { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";

import "../styles/videoSection.scss";

const VideoSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef   = useRef<HTMLVideoElement>(null);

  const inView = useInView(sectionRef, { once: false, amount: 0.3 });
  useEffect(() => {
    if (!videoRef.current) return;
    if (inView) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [inView]);

  const [targetWidth, setTargetWidth] = useState("60%");
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w <= 480)        setTargetWidth("100%");
      else if (w <= 1024)   setTargetWidth("90%");
      else                 setTargetWidth("57%");
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const navigate = useNavigate();

  return (
    <section ref={sectionRef} className="video-section">
      <h1 className="video-header">
        Your Food Deserves
        
        a Spotlight
      </h1>

      <motion.video
        ref={videoRef}
        className="video-container"
        loop
        muted
        initial={{ width: "100%" }}
        whileInView={{ width: targetWidth }}
        transition={{ duration: 1.7, ease: "easeInOut" }}
        viewport={{ once: true, amount: 0.3 }}
        style={{ display: "block", margin: "0 auto" }}
      >
        <source src="/video1.MP4" type="video/mp4" />
        Your browser does not support the video tag.
      </motion.video>

      <div className="video-text-btn">
        <p className="video-text">Explore how we present your items!</p>
        <div className="video-btn-wrapper">
          <button
            className="circle-arrow-btn"
            onClick={() => navigate("/menus")}
          >
            <span className="btn-text">Explore Menus</span>
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
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
