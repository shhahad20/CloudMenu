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

  useEffect(() => {
    fetchLibraryTemplate("83c312aa-0fa5-4ea0-833c-736ceca462d9").then(
      (data: Template) => {
        setTemplate(data);

        // find the "New" section (case-insensitive)
        const newIndex = data.config.sections.findIndex(
          (sec) => sec.name.trim().toLowerCase() === "new"
        );

        // if we found it, use that index; otherwise default to 0
        setCurrentSectionIndex(newIndex >= 0 ? newIndex : 0);
      }
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
            <div className="t2-top-container">
            <img
              src={template?.config.logo ? template.config.logo : "/Kia.svg"}
              className="t2-logo"
              alt="Logo"
              onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== window.location.origin + "/Kia.svg") {
                target.src = "/Kia.svg";
              }
              }}
            />
            <p className="t2-slogan">{template?.config.slogan || "Quality Beans, Rich Flavor"}</p>
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
                        {item.image ? (
                          <img src={item.image} alt="item-image" />
                        ) : (
                          <span className="t2-no-image">
                            No image available
                          </span>
                        )}
                      </div>
                      <div className="t2-item-right">
                        <h2 className="t2-item-name">
                          {item.name}{" "}
                          <span className="t2-sub-text">{item.subText}</span>
                        </h2>
                        <p className="t2-item-description">
                          {item.description || "No description available"}
                        </p>
                        <p className="t2-item-calories">
                          {item.calories || "342 "} calories
                        </p>
                        <p className="t2-price">
                          <span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="13"
                              height="14"
                              viewBox="0 0 13 14"
                              fill="none"
                            >
                              <g clip-path="url(#clip0_208_124)">
                                <path
                                  d="M8.09056 12.4025C7.85858 12.8982 7.70523 13.436 7.64648 14.0001L12.5557 12.9945C12.7877 12.499 12.9409 11.961 12.9998 11.397L8.09056 12.4025Z"
                                  fill="#1E1E1E"
                                />
                                <path
                                  d="M12.5559 9.98193C12.7879 9.4864 12.9413 8.94842 13 8.38436L9.17589 9.16805V7.66151L12.5558 6.96941C12.7878 6.47388 12.9411 5.9359 12.9999 5.37184L9.17577 6.15486V0.736889C8.5898 1.05391 8.0694 1.4759 7.64638 1.97365V6.4682L6.11699 6.78143V0C5.53102 0.316908 5.01062 0.739006 4.5876 1.23677V7.09455L1.16558 7.79522C0.933594 8.29075 0.780134 8.82874 0.721271 9.3928L4.5876 8.60109V10.4983L0.444073 11.3467C0.212091 11.8423 0.0587471 12.3802 0 12.9443L4.33711 12.0562C4.69017 11.9854 4.99362 11.7843 5.19091 11.5075L5.98631 10.3713V10.371C6.06888 10.2535 6.11699 10.1117 6.11699 9.95909V8.28786L7.64638 7.97463V10.9877L12.5558 9.98171L12.5559 9.98193Z"
                                  fill="#1E1E1E"
                                />
                              </g>
                              <defs>
                                <clipPath id="clip0_208_124">
                                  <rect width="13" height="14" fill="white" />
                                </clipPath>
                              </defs>
                            </svg>
                          </span>
                          {item.price} SAR
                        </p>
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
