import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTemplate, Section } from "../api/templates";
import { API_URL } from "../api/api";
import { TemplateConfig } from "../api/templates";
import "../styles/templateBuilder.scss";
import Navbar from "./Navbar";
import GeneralForm from "./BuilderComponents/GeneralForm";
import SectionsForm from "./BuilderComponents/SectionsForm";
import ItemsForm from "./BuilderComponents/ItemsForm";

type Tab = "general" | "sections" | "items";

const HeaderImageBuilder = ({
  initialConfig,
}: {
  initialConfig: TemplateConfig;
}) => {
  const { id } = useParams<{ id: string }>();
  const [config, setConfig] = useState<TemplateConfig>(initialConfig);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [focusedSectionIdx, setFocusedSectionIdx] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    getTemplate(id!)
      .then((tpl) => setConfig(tpl.config))
      .catch(() => setError("Failed to load template."))
      .finally(() => setLoading(false));
  }, [id]);

  // 1) General updates merge at root
  const handleGeneralChange = (updates: Partial<TemplateConfig>) => {
    setConfig((c) => ({ ...c, ...updates }));
  };

  // 2) Replace the entire sections array
  const handleSectionsChange = (newSections: Section[]) =>
    setConfig((c) => ({ ...c, sections: newSections }));

  // 3) Handle items array updates for the focused section
  const handleItemsChange = (newItems: Section["items"]) =>
    setConfig((c) => {
      const secs = [...c.sections];
      secs[focusedSectionIdx] = { ...secs[focusedSectionIdx], items: newItems };
      return { ...c, sections: secs };
    });

  const handleSaveAll = async () => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/templates/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ config }),
      });
      if (!res.ok) throw new Error(await res.text());
      alert("All changes saved!");
      navigate(`/menus/${id}`, { replace: true });
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message || "Save failed");
      } else {
        setError("Save failed");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading…</p>
    </div>
  );

  return (
    <>
      <Navbar />
      <main className="builder-container">
        <div className="builder-header-section">
          <h1 className="builder-header">Edit Template</h1>
          {error && (
            <div className="error-banner">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="error-close">×</button>
            </div>
          )}
        </div>

        {/* Mobile-first Tab Navigation */}
        <nav className="tabs-navigation" role="tablist">
          <div className="tabs-wrapper">
            <div className="builder-tabs">
              {(["general", "sections", "items"] as Tab[]).map((t) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={activeTab === t}
                  className={`tab-btn ${activeTab === t ? "active" : ""}`}
                  onClick={() => setActiveTab(t)}
                >
                  <span className="tab-text">
                    {t[0].toUpperCase() + t.slice(1)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <div className="builder-content">
          <div className="builder-tabs-container" role="tabpanel">
            {/* General Tab */}
            {activeTab === "general" && (
              <section className="tab-content general-tab">
                <GeneralForm general={config} onChange={handleGeneralChange} />
              </section>
            )}

            {/* Sections Tab */}
            {activeTab === "sections" && (
              <section className="tab-content sections-tab">
                <SectionsForm
                  sections={config.sections}
                  focusedIndex={focusedSectionIdx}
                  onFocusChange={setFocusedSectionIdx}
                  onChange={handleSectionsChange}
                />
              </section>
            )}

            {/* Items Tab */}
            {activeTab === "items" && (
              <section className="tab-content items-tab">
                {/* Section Picker - Mobile Optimized */}
                <div className="section-picker-container">
                  <fieldset className="section-picker">
                    <legend>Select Section</legend>
                    <div className="select-wrapper">
                      <select
                        value={focusedSectionIdx}
                        onChange={(e) =>
                          setFocusedSectionIdx(Number(e.target.value))
                        }
                        className="section-select"
                      >
                        {config.sections.map((sec, idx) => (
                          <option key={sec.id} value={idx}>
                            {sec.name || `Section ${idx + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </fieldset>
                </div>

                {/* Items Form */}
                <div className="items-form-container">
                  <ItemsForm
                    sectionId={config.sections[focusedSectionIdx].id}
                    sectionIndex={focusedSectionIdx}
                    items={config.sections[focusedSectionIdx].items}
                    onChange={handleItemsChange}
                  />
                </div>
              </section>
            )}
          </div>

          {/* Sticky Bottom Actions */}
          <div className="actions-bottom">
            <div className="actions-container">
              <button 
                className={`btn save ${saving ? 'loading' : ''}`} 
                onClick={handleSaveAll}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="btn-spinner"></span>
                    Saving...
                  </>
                ) : (
                  'Save All Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default HeaderImageBuilder;