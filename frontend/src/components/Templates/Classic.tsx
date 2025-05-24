// src/components/menus/Template1Renderer.tsx
import React, { useState } from "react";
import "../../styles/menus/template1.scss";
import { Template, TextBlock } from "../../api/templates";

export const currentYear = new Date().getFullYear();

interface Props {
  template: Template;
}

const Template1: React.FC<Props> = ({ template }) => {
  // only keep the index state
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  // pull everything off the passed-in template
  const sections = template.config.sections || [];
  const textBlocks: TextBlock[] = template.config.text || [];

  // helper to get text by id
  const findText = (id: string) =>
    textBlocks.find((tb) => tb.id === id)?.value || "";

  const introText = findText("intro");
  const highlightText = findText("highlight");
  const footerText = findText("footer");

  const { primary, secondary, background } =
    template.config.colors || {
      primary: "#121212",
      secondary: "#2b3642",
      background: "#f9f4ed",
    };

  const handlePrevious = () =>
    setCurrentSectionIndex((i) =>
      i > 0 ? i - 1 : sections.length - 1
    );

  const handleNext = () =>
    setCurrentSectionIndex((i) =>
      i < sections.length - 1 ? i + 1 : 0
    );

  return (
    <div
      className="menu-container"
      style={
        {
          "--color-primary": primary,
          "--color-secondary": secondary,
          "--color-background": background,
        } as React.CSSProperties
      }
    >
      <div className="menu-navbar">
        <ul className="ul-container">
          <li>Menu</li>
          <li>Offers</li>
          <li>Contact</li>
        </ul>
      </div>

      <div className="menu-top-container">
        <div className="top-item">
          <div className="news-container">
            <h1>{introText}</h1>
            <p>{highlightText}</p>
          </div>
        </div>
        <div className="top-item top-img">
          <img
            className="menu-img"
            src={template.config.header_image}
            alt="Header Image"
          />
        </div>
      </div>

      <div className="menu-bottom-container">
        <div className="t1-bottom-container">
          {sections.length > 0 && (
            <>
              <div className="arrows">
                <button
                  className="arrow-button left"
                  onClick={handlePrevious}
                >
                  {/* your left arrow SVG */}
                </button>
              </div>

              <div className="temp1-list-container">
                <h1 className="t1-list-header">
                  {sections[currentSectionIndex].name}
                </h1>
                <div className="t1-list-items">
                  {sections[currentSectionIndex].items.map(
                    (item, idx) => (
                      <div className="t1-item" key={idx}>
                        <div className="t1-item-content">
                          <h2>{item.name}</h2>
                          <p>{item.id}</p>
                        </div>
                        <p className="t1-price">
                          {item.price} SAR
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="arrows">
                <button
                  className="arrow-button right"
                  onClick={handleNext}
                >
                  {/* your right arrow SVG */}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <footer className="t1-footer">
        <p>{footerText}</p>
        <p>© {currentYear} All rights reserved. Powered by CloudMenu</p>
      </footer>
    </div>
  );
};

export default Template1;
