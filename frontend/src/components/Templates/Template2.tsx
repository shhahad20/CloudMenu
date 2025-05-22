import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import "../../styles/menus/template2.scss";
import { fetchLibraryTemplate, Template } from "../../api/templates";

export const cureentYear = new Date().getFullYear();

const Template2 = () => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [template, setTemplate] = useState<Template | null>(null);

    const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);


  // Fetch data on component mount
  useEffect(() => {
    fetchLibraryTemplate("83c312aa-0fa5-4ea0-833c-736ceca462d9").then(
      (data: Template) => setTemplate(data)
    );
  }, []);

  // compute and animate offset
  const [xOffset, setXOffset] = useState(0);
  useEffect(() => {
    const nav = navRef.current;
    const item = itemRefs.current[currentSectionIndex];
    if (!nav || !item) return;

    const navWidth = nav.clientWidth;
    const itemCenter = item.offsetLeft + item.clientWidth / 2;
    // we want itemCenter + x = navWidth/2 → x = navWidth/2 - itemCenter
    const targetX = navWidth / 2 - itemCenter;
    setXOffset(targetX);
  }, [currentSectionIndex, template]);

  const templateSections = template?.config.sections || [];

  //   const handlePrevious = () => {
  //     setCurrentSectionIndex((prevIndex) =>
  //       prevIndex > 0 ? prevIndex - 1 : templateSections.length - 1
  //     );
  //   };

  //   const handleNext = () => {
  //     setCurrentSectionIndex((prevIndex) =>
  //       prevIndex < templateSections.length - 1 ? prevIndex + 1 : 0
  //     );
  //   };
  const { primary, secondary, background } = template?.config.colors || {
    primary: "#121212",
    secondary: "#2b3642",
    background: "white",
  };

  return (
    <div
      className="t2-menu-container"
      style={
        {
          "--color-primary": primary,
          "--color-secondary": secondary,
          "--color-background": background,
        } as React.CSSProperties
      }
    >
      <div className="t2-menu-top-container">
        <div className="t2-top-item">
          <div className="t2-news-container">
            <img src="/logo-t2.png" className="t2-logo" alt="Logo" />
            <p>Try our NEW items!</p>
          </div>
        </div>
      </div>
<div className="t2-menu-sections">
        {/* outer wrapper: overflow hidden */}
        <div className="t2-navbar-wrapper" ref={navRef}>
          {/* motion.div is our sliding strip */}
          <motion.div
            className="t2-navbar"
            animate={{ x: xOffset }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {templateSections.map((section, idx) => (
              <button
                key={section.id}
                ref={(el) => (itemRefs.current[idx] = el)}
                className={`t2-navbar-item ${
                  idx === currentSectionIndex ? "active" : ""
                }`}
                onClick={() => setCurrentSectionIndex(idx)}
              >
                {section.name}
              </button>
            ))}
          </motion.div>
        </div>
      </div>
      <div className="t2-menu-bottom-container">
        {templateSections.length > 0 && (
          <>
            <div className="temp2-list-container">
              <div className="t2-list-items">
                {templateSections[currentSectionIndex]?.items.map(
                  (item, index: number) => (
                    <div className="t2-item" key={index}>
                      <div className="t2-item-left">
                        <img src="/iced-coffee.svg" alt="item-image" />
                      </div>
                      <div className="t2-item-right">
                        <h2 className="t2-item-name">{item.name}</h2>
                        <p className="t2-item-description">
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit, sed do eiusmod tempor incididunt ut labore et
                          dolore.
                        </p>
                        <p className="t2-item-calories">352 calories</p>
                        <p className="t2-price">{item.price} SAR</p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <footer className="t2-footer">
        <p>© {cureentYear} All rights reserved. Powered by CloudMenu</p>
      </footer>
    </div>
  );
};

export default Template2;
