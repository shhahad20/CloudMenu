import React, { useEffect, useState } from "react";
import "../styles/menuTemplates.scss";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SearchBar from "../components/UI/SearchBar";
import { cloneTemplate, fetchLibraryTemplates, Template } from "../api/templates";
import { Link, useNavigate } from "react-router-dom";

// import { useNavigate } from "react-router-dom";

// interface Template {
//   id: number;
//   title: string;
//   imageUrl: string;
//   description: string;
//   price: string; // ← new
// }

// const templates: Template[] = [
//   {
//     id: 1,
//     title: "Classic Café",
//     imageUrl: "/templates/classic-cafe.jpg",
//     description: "A clean, elegant layout with serif headings.",
//     price: "Free",
//   },
//   {
//     id: 2,
//     title: "Modern Bistro",
//     imageUrl: "/templates/modern-bistro.jpg",
//     description: "Bold colors and strong imagery for a trendy vibe.",
//     price: "$24.99",
//   },
//   {
//     id: 3,
//     title: "Rustic Diner",
//     imageUrl: "/templates/rustic-diner.jpg",
//     description: "Warm tones and handcrafted feel.",
//     price: "Free",
//   },
//   {
//     id: 4,
//     title: "Minimalist",
//     imageUrl: "/templates/minimalist.jpg",
//     description: "White space‑heavy design with simple typography.",
//     price: "$22.00",
//   },
//   // …add as many as you like
// ];

const MenuTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const navigate = useNavigate();
// per-template error & loading states:
const [cloneErrors, setCloneErrors]       = useState<Record<string,string>>({});
const [cloneLoading, setCloneLoading]     = useState<Record<string,boolean>>({});

const navigate = useNavigate();

useEffect(() => {
  fetchLibraryTemplates()
    .then((list) => setTemplates(list))
    .catch((err) => {
      console.error(err);
      setError("Failed to load templates.");
    })
    .finally(() => setLoading(false));
}, []);

const handleClone = async (tplId: string) => {
  // clear any previous error for this template
  setCloneErrors(errs => ({ ...errs, [tplId]: "" }));
  setCloneLoading(ls => ({ ...ls, [tplId]: true }));
  try {
    const newTpl = await cloneTemplate(tplId);
    navigate(`/builder/${newTpl.id}`);
  } catch (err: unknown) {
    console.error(err);
    setCloneErrors(errs => ({
      ...errs,
      [tplId]: err instanceof Error ? err.message : "Could not create your copy."
    }));
  } finally {
    setCloneLoading(ls => ({ ...ls, [tplId]: false }));
  }
};

  


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
          {loading && <p>Loading templates…</p>}
          {error && <p className="error">{error}</p>}
          {!loading && !error && (
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
                    your ideal menu—tell us your preferences, and we’ll handle
                    the rest!
                  </p>
                  <a href="/" className="btn-view">
                    Order a Template ↗
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
                    src={tpl.preview_url}
                    alt="Preview Image"
                  />
                  <div className="template-content">
                    <h3>{tpl.name}</h3>
                    {/* <p>{tpl.description}</p> */}
                    {/* <a href={`/templates/${tpl.id}`} className="btn-view">
                    View Template ↗
                  </a> */}
                    <Link to={`/menus/${tpl.id}`} className="btn-view" target="_blank" rel="noopener noreferrer">
                      View Template ↗
                    </Link>
                    <button
                      className="btn-view clone-btn"
                      onClick={() => handleClone(tpl.id)}
                      disabled={!!cloneLoading[tpl.id]}
                    >
                      {cloneLoading[tpl.id] ? "Cloning…" : "Use this Template ↗"}
                    </button>

                    {cloneErrors[tpl.id] && (
                        <p className="clone-error" style={{ color: "red", fontWeight: "500" }}>
                        {cloneErrors[tpl.id]}
                        </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
};

export default MenuTemplates;
