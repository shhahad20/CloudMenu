import { useEffect, useState } from "react";
import "../../styles/menus/template1.scss";
import {  getTemplate, Template,TextBlock } from "../../api/templates";
import { useParams } from "react-router-dom";
import { cureentYear } from "./Classic";


const Template1Renderer = () => {
  const { id } = useParams<{ id: string }>();

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [template, setTemplate] = useState<Template | null>(null);
  // Fetch data on component mount
  useEffect(() => {
    getTemplate(id!)
    .then((data: Template) => setTemplate(data))
  }, []);

  const templateSections = template?.config.sections || [];

  // ② grab text blocks
  const textBlocks: TextBlock[] = template?.config.text || [];

  // ③ find colors
  const { primary, secondary, background } = template?.config.colors || { primary: "#121212", secondary: "#2b3642", background: "#f9f4ed" };

  const findText = (id: string) =>
    textBlocks.find(tb => tb.id === id)?.value || "";

  const introText     = findText("intro");
  const highlightText = findText("highlight");
  const footerText = findText("footer");

  const handlePrevious = () => {
    setCurrentSectionIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : templateSections.length - 1
    );
  };

  const handleNext = () => {
    setCurrentSectionIndex((prevIndex) =>
      prevIndex < templateSections.length - 1 ? prevIndex + 1 : 0
    );
  };

  return (
    <div className="menu-container" style={{
      "--color-primary": primary,
      "--color-secondary": secondary,
      "--color-background": background,
    } as React.CSSProperties}>
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
            {/* <h1>TODAY’S MOOD IS SPONSORED BY COFFEE</h1> */}
            <h1>{introText}</h1>
            {/* <p>Try our NEW Coffee Latte</p> */}
            <p>{highlightText}</p>
          </div>
        </div>
        <div className="top-item top-img">
          <img
            className="menu-img"
            src={template?.config.header_image}
            alt="Header Image"
          />
        </div>
      </div>

      <div className="menu-bottom-container">
        <div className="t1-bottom-container">
          {templateSections.length > 0 && (
            <>
              <div className="arrows">
                <button className="arrow-button left" onClick={handlePrevious}>
                  <img
                    src="https://gmedumcwhafnklxzslfc.supabase.co/storage/v1/object/sign/menu-images/arrow-left.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzZiMDRkNGEyLTUyMDAtNDkzOC1iZWU2LTkxODcwMjJkNTNmOCJ9.eyJ1cmwiOiJtZW51LWltYWdlcy9hcnJvdy1sZWZ0LnN2ZyIsImlhdCI6MTc0NTgzODA1NCwiZXhwIjoxODcxOTgyMDU0fQ.X_sY8FCJpggDZ0005m1RQBFqbs-DH9nFwsY9_QsIVrU"
                    alt="Left Arrow"
                  />
                </button>
              </div>
              <div className="temp1-list-container">
                <h1 className="t1-list-header">
                  {templateSections[currentSectionIndex].name || ""}
                </h1>
                <div className="t1-list-items">
                  {templateSections[currentSectionIndex]?.items.map(
                    (item, index: number) => (
                      <div className="t1-item" key={index}>
                        <div className="t1-item-content">
                          <h2>{item.name}</h2>
                          <p>{item.id}</p>
                        </div>
                        <p className="t1-price">{item.price} SAR</p>
                      </div>
                    )
                  )}
                </div>
              </div>
              <div className="arrows">
                <button className="arrow-button right" onClick={handleNext}>
                  <img
                    src="https://gmedumcwhafnklxzslfc.supabase.co/storage/v1/object/sign/menu-images/arrow-right.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzZiMDRkNGEyLTUyMDAtNDkzOC1iZWU2LTkxODcwMjJkNTNmOCJ9.eyJ1cmwiOiJtZW51LWltYWdlcy9hcnJvdy1yaWdodC5zdmciLCJpYXQiOjE3NDU4MzgwOTUsImV4cCI6MTg3MTk4MjA5NX0.iqoZMzGfYXRxLEg4nwC6ONqL7Lxc6KnL3zFs1jIY3_c"
                    alt="Right Arrow"
                  />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <footer className="t1-footer">
        <p>{footerText}</p>
        <p>© {cureentYear} All rights reserved. Powered by CloudMenu</p>
      </footer>
    </div>
  );
};

export default Template1Renderer;