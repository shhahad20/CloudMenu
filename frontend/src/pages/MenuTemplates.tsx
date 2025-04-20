import React from "react";
import "../styles/menuTemplates.scss";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SearchBar from "../components/UI/SearchBar";

interface Template {
  id: number;
  title: string;
  imageUrl: string;
  description: string;
  price: string; // ← new
}

const templates: Template[] = [
  {
    id: 1,
    title: "Classic Café",
    imageUrl: "/templates/classic-cafe.jpg",
    description: "A clean, elegant layout with serif headings.",
    price: "Free",
  },
  {
    id: 2,
    title: "Modern Bistro",
    imageUrl: "/templates/modern-bistro.jpg",
    description: "Bold colors and strong imagery for a trendy vibe.",
    price: "$24.99",
  },
  {
    id: 3,
    title: "Rustic Diner",
    imageUrl: "/templates/rustic-diner.jpg",
    description: "Warm tones and handcrafted feel.",
    price: "Free",
  },
  {
    id: 4,
    title: "Minimalist",
    imageUrl: "/templates/minimalist.jpg",
    description: "White space‑heavy design with simple typography.",
    price: "$22.00",
  },
  // …add as many as you like
];

const MenuTemplates: React.FC = () => {
  return (
    <>
      <Navbar />
      <section id="menu-templates-section">
        <div className="templates-container">
          <h2 className="section-title">Menu Templates</h2>
          <div className="searchbar-container">
            <SearchBar
              onSearch={(query) => console.log("Searching for:", query)}
            />
          </div>

          <div className="templates-grid">
            <div className="template-card custom-card">
              <div className="price-tag custom-tag-price">Custom</div>
              <div className="template-content">
              <img
                className="template-image"
                src="/"
                alt="Request a Custom Menu"
              />
                <h3>Request a Custom Menu</h3>
                <p>
                  Request a design that matches your unique taste. ersonalize
                  your ideal menu—tell us your preferences, and we’ll handle the
                  rest!
                </p>
                <a href="/" className="btn-view">
                  View Template ↗
                </a>
              </div>
            </div>
            {templates.map((tpl) => (
              <div key={tpl.id} className="template-card">
                {/* Price badge */}
                <div className="price-tag">{tpl.price}</div>

                {/* Image + content */}
                <img
                  className="template-image"
                  src={tpl.imageUrl}
                  alt={tpl.title}
                />
                <div className="template-content">
                  <h3>{tpl.title}</h3>
                  <p>{tpl.description}</p>
                  <a href={`/templates/${tpl.id}`} className="btn-view">
                    View Template ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default MenuTemplates;
