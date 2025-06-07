import React, { useState } from "react";
import "../../styles/menus/MoriningRituals.scss";
import { Section, Template, TextBlock } from "../../api/templates";

export const currentYear = new Date().getFullYear();

interface Props {
  template: Template;
}

const MoriningRituals: React.FC<Props> = ({ template }) => {
  // --- 1. extract text & colors as before ---
  const textBlocks = template.config.text as TextBlock[];
  const findText = (id: string) =>
    textBlocks.find((t) => t.id === id)?.value || "";
  const footerText = findText("footer");
  const { background, text: textColor } = template.config.colors || {};

  // --- 2. transform your new subsections shape into a flat array ---
  const rawSubsections =
    (template.config.sections?.[0]?.subSections as Section[]) || [];
  const menuSections = rawSubsections.map((obj) => {
    const [id, data] = Object.entries(obj)[0] as [
      string,
      { image: string; sections: Section[] }
    ];
    return {
      id,
      name: id[0].toUpperCase() + id.slice(1),
      image: data.image,
      sections: data.sections.map((s: Section) => ({
        name: s.name,
        items: s.items,
      })),
    };
  });

  // --- 3. handle carousel logic ---
  const [currentIndex, setCurrentIndex] = useState(0);
  const current = menuSections[currentIndex];
  const next = () => setCurrentIndex((i) => (i + 1) % menuSections.length);

  return (
    <div
      className="breakfast-menu"
      style={
        {
          "--color-background": background,
          "--color-text": textColor,
        } as React.CSSProperties
      }
    >
      {/* Container to match menu content width */}
      <div className="menu-container">
        {/* Hero Section with Image and Title */}
        <div className="hero-section">
          {/* Left Side - Image (50% width) */}
          <div className="hero-image">
            <div className="dish-card">
              <img src={current.image} alt={`${current.name} Dish`} />
            </div>
          </div>

          {/* Right Side - Title and Time (50% width) */}
          <div className="hero-content">
            <h1 className="main-title">{template.config.logo}</h1>
            <p className="timezone">11:05 AM - Saudi Arabia</p>
          </div>
        </div>

        {/* Menu Content Container */}
        <div className="menu-content-container">
          {/* Menu Title with clickable arrow */}
          <h2 className="breakfast-title">
            {current.name}
            <span
              className="animated-arrow clickable-arrow"
              onClick={next}
              style={{ cursor: "pointer", paddingLeft: "1rem" }}
            >
              ›
            </span>
          </h2>

          <div className="menu-grid">
            {current.sections.map((section, sIdx) => (
              <div className="menu-section" key={sIdx}>
                <h3 className="section-title">{section.name}</h3>
                <div className="menu-items">
                  {section.items.map((item, iIdx) => (
                    <div className="menu-item" key={iIdx}>
                      <div className="item-content">
                        <h4 className="item-name">
                          {item.name}{" "}
                          <span className="item-price">
                            <span className="currency-icon">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="13"
                                height="14"
                                viewBox="0 0 13 14"
                                fill="none"
                              >
                                <g clipPath="url(#clip0_208_124)">
                                  <path
                                    d="M8.09056 12.4025C7.85858 12.8982 7.70523 13.436 7.64648 14.0001L12.5557 12.9945C12.7877 12.499 12.9409 11.961 12.9998 11.397L8.09056 12.4025Z"
                                    fill="currentColor"
                                  />
                                  <path
                                    d="M12.5559 9.98193C12.7879 9.4864 12.9413 8.94842 13 8.38436L9.17589 9.16805V7.66151L12.5558 6.96941C12.7878 6.47388 12.9411 5.9359 12.9999 5.37184L9.17577 6.15486V0.736889C8.5898 1.05391 8.0694 1.4759 7.64638 1.97365V6.4682L6.11699 6.78143V0C5.53102 0.316908 5.01062 0.739006 4.5876 1.23677V7.09455L1.16558 7.79522C0.933594 8.29075 0.780134 8.82874 0.721271 9.3928L4.5876 8.60109V10.4983L0.444073 11.3467C0.212091 11.8423 0.0587471 12.3802 0 12.9443L4.33711 12.0562C4.69017 11.9854 4.99362 11.7843 5.19091 11.5075L5.98631 10.3713V10.371C6.06888 10.2535 6.11699 10.1117 6.11699 9.95909V8.28786L7.64638 7.97463V10.9877L12.5558 9.98171L12.5559 9.98193Z"
                                    fill="currentColor"
                                  />
                                </g>
                                <defs>
                                  <clipPath id="clip0_208_124">
                                    <rect width="13" height="14" fill="white" />
                                  </clipPath>
                                </defs>
                              </svg>
                            </span>
                            {item.price}
                          </span>
                        </h4>
                        <p className="item-description">{item.description}</p>
                        <p className="item-calories">
                          {item.calories} calories
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <footer className="menu-footer">
        {footerText && <p className="footer-text">{footerText}</p>}

        <p className="copyright">© {currentYear} All rights reserved.</p>
      </footer>
    </div>
  );
};

export default MoriningRituals;
