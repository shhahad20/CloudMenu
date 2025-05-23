import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTemplate } from "../api/templates";
import { API_URL } from "../api/api";
import { TemplateConfig } from "../api/templates";
import "../styles/templateBuilder.scss";
import Navbar from "./Navbar";

type Tab = "general" | "sections" | "items";

const HeaderImageBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  // const [currentUrl, setCurrentUrl] = useState<string | undefined>();
  const [config, setConfig] = useState<TemplateConfig | null>(null);
  const [saving, setSaving] = useState(false);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>("general");
  const navigate = useNavigate();

  const [editingSectionIdx, setEditingSectionIdx] = useState<number | null>(
    null
  );
  const [editingItemIdx, setEditingItemIdx] = useState<number | null>(null);

  // tpl => setCurrentUrl(tpl.config.header_image)
  useEffect(() => {
    getTemplate(id!)
      .then((tpl) => setConfig(tpl.config))
      .catch(() => setError("Failed to load template."))
      .finally(() => setLoading(false));
  }, [id]);

  // Helpers to immutably update nested config:
  const updateField = <K extends keyof TemplateConfig>(
    key: K,
    value: TemplateConfig[K]
  ) => {
    setConfig((c) => (c ? { ...c, [key]: value } : c));
  };

  const updateColor = (
    colorKey: keyof TemplateConfig["colors"],
    value: string
  ) => {
    if (config && config.colors) {
      updateField("colors", { ...config.colors, [colorKey]: value });
    }
  };

  const [newSectionName, setNewSectionName] = useState("");
  const [sectionImagePreview, setSectionImagePreview] = useState<string | null>(
    null
  );

  const handleAddSection = () => {
    if (!newSectionName.trim()) return;
    setConfig((c) =>
      c
        ? {
            ...c,
            sections: [
              ...c.sections,
              {
                id: crypto.randomUUID(),
                name: newSectionName,
                items: [],
                image: sectionImagePreview,
              },
            ],
          }
        : c
    );
    setNewSectionName("");
    setSectionImagePreview(null);
  };

  const handleRemoveSection = (idx: number) => {
    setConfig((c) =>
      c
        ? {
            ...c,
            sections: c.sections.filter((_, i) => i !== idx),
          }
        : c
    );
  };

  const handleDeleteSections = () => {
    setConfig((c) =>
      c
        ? {
            ...c,
            sections: [],
          }
        : c
    );
  };

  const handleSectionImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSectionImagePreview(url);
    // you’ll also want to include this file in your PATCH when saving…
  };
  const handleUpdateSection = () => {
    if (editingSectionIdx === null) return;
    setConfig((c) => {
      if (!c) return c;
      const secs = [...c.sections];
      secs[editingSectionIdx] = {
        ...secs[editingSectionIdx],
        name: newSectionName,
        // image: sectionImagePreview || secs[editingSectionIdx].image,
      };
      return { ...c, sections: secs };
    });
    // reset:
    setEditingSectionIdx(null);
    setNewSectionName("");
    setSectionImagePreview(null);
  };

  // const updateSection = (idx: number, section: Section) => {
  //   if (!config) return;
  //   const newSections = [...(config.sections || [])];
  //   newSections[idx] = section;
  //   updateField("sections", newSections);
  // };

  // const addSection = () => {
  //   setConfig((c) =>
  //     c
  //       ? {
  //           ...c,
  //           sections: [
  //             ...c.sections,
  //             { id: crypto.randomUUID(), name: "", items: [] },
  //           ],
  //         }
  //       : c
  //   );
  // };

  // const removeSection = (idx: number) => {
  //   setConfig((c) =>
  //     c
  //       ? {
  //           ...c,
  //           sections: c.sections.filter((_, i) => i !== idx),
  //         }
  //       : c
  //   );
  // };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this template?"))
      return;
    try {
      const res = await fetch(`${API_URL}/templates/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (!res.ok) throw new Error(await res.text());
      alert("Template deleted.");
      navigate("/dashboard/menus", { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Delete failed:", err);
        alert("Delete failed: " + err.message);
      } else {
        console.error("Delete failed: Unknown error.");
        alert("Delete failed: Unknown error.");
      }
    }
  };

  // header image upload handler
  const handleHeaderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);

    const form = new FormData();
    form.append("image_url", file); // must match your multer key

    try {
      const res = await fetch(`${API_URL}/templates/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          // no Content-Type!
        },
        body: form,
      });
      // Try to parse JSON, but guard against invalid bodies
      let body: { config?: TemplateConfig; error?: string } | null = null;
      try {
        body = await res.json();
      } catch {
        throw new Error("Server did not return valid JSON.");
      }

      // If the HTTP status is not OK, bubble up the server message
      if (!res.ok) {
        const msg = body?.error || `HTTP ${res.status}`;
        throw new Error(msg);
      }

      // Now check that config really came back
      if (!body || typeof body.config !== "object") {
        throw new Error("No config returned from server.");
      }

      // Success!
      setConfig(body.config);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Image upload failed: ${err.message}`);
      } else {
        setError("Image upload failed: An unknown error occurred.");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
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
      // you could re-fetch if you like, or trust it worked
      alert("Saved successfully!");
      navigate(`/menus/${id}`, { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError("Save failed: " + err.message);
      } else {
        setError("Save failed: An unknown error occurred.");
      }
    } finally {
      setSaving(false);
    }
  };
  // items state
  // which section we’re managing items for
  const [selectedSectionIdx, setSelectedSectionIdx] = useState<number>(0);
  // new-item fields
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [itemImagePreview, setItemImagePreview] = useState<string | null>(null);

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    setConfig((c) => {
      if (!c) return c;
      const sections = [...c.sections];
      const sec = { ...sections[selectedSectionIdx] };
      sec.items = [
        ...sec.items,
        {
          id: crypto.randomUUID(),
          name: newItemName,
          price: newItemPrice,
          imageUrl: itemImagePreview || undefined,
        },
      ];
      sections[selectedSectionIdx] = sec;
      return { ...c, sections };
    });
    // reset
    setNewItemName("");
    setNewItemPrice("");
    setItemImagePreview(null);
  };

  const handleRemoveItem = (itemIdx: number) => {
    setConfig((c) => {
      if (!c) return c;
      const sections = [...c.sections];
      const sec = { ...sections[selectedSectionIdx] };
      sec.items = sec.items.filter((_, i) => i !== itemIdx);
      sections[selectedSectionIdx] = sec;
      return { ...c, sections };
    });
  };

  const handleDeleteAllItems = () => {
    setConfig((c) => {
      if (!c) return c;
      const sections = [...c.sections];
      sections[selectedSectionIdx] = {
        ...sections[selectedSectionIdx],
        items: [],
      };
      return { ...c, sections };
    });
  };
  const handleUpdateItem = () => {
    if (editingItemIdx === null) return;
    setConfig((c) => {
      if (!c) return c;
      const secs = [...c.sections];
      const sec = { ...secs[selectedSectionIdx] };
      const items = [...sec.items];
      items[editingItemIdx] = {
        ...items[editingItemIdx],
        name: newItemName,
        price: newItemPrice,
        // imageUrl: itemImagePreview || items[editingItemIdx].imageUrl,
      };
      sec.items = items;
      secs[selectedSectionIdx] = sec;
      return { ...c, sections: secs };
    });
    // reset:
    setEditingItemIdx(null);
    setNewItemName("");
    setNewItemPrice("");
    // setItemImagePreview(null);
  };

  const handleItemImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setItemImagePreview(url);
  };

  if (loading) return <p>Loading…</p>;

  return (
    <>
      <Navbar />
      <div className="builder-container">
        <h1 className="builder-header">Edit Template</h1>

        {/* 1) Tabs */}
        <div className="tabs-wrapper">
          <div className="builder-tabs">
            {(["general", "sections", "items"] as Tab[]).map((t) => (
              <button
                key={t}
                className={`tab-btn ${activeTab === t ? "active" : ""}`}
                onClick={() => setActiveTab(t)}
              >
                {t[0].toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="builder-container-inner">
          {/* 2) Tab Content */}
          {activeTab === "general" && (
            <div className="tab-content general">
              {/* Left Column */}
              <div className="col left">
                {/* Logo */}
                <fieldset>
                  <legend>Logo</legend>
                  <input
                  type="text"
                  value={config?.logo || ""}
                  onChange={(e) => updateField("logo", e.target.value)}
                  placeholder="Logo URL or name"
                  />
                  {config?.logo && config.logo.startsWith("http") ? (
                  <div className="logo-image-container">
                    {config.logo ? (
                    <img src={config.logo} alt="Logo" />
                    ) : (
                    <div className="placeholder">No logo image</div>
                    )}
                    <input
                    className="file-input"
                    type="file"
                    accept="image/*"
                    disabled={uploading}
                    // You need to implement handleLogoUpload if you want to support logo image upload
                    // onChange={handleLogoUpload}
                    onClick={(e) => {
                      if (!config.logo || !config.logo.startsWith("http")) {
                      e.preventDefault();
                      }
                    }}
                    />
                  </div>
                  ) : (
                  <div style={{ color: "#888", fontSize: "0.9em", marginTop: 8 }}>
                    Image upload only allowed if logo is an image URL.
                  </div>
                  )}
                </fieldset>

                {/* Colors */}
                <fieldset>
                  <legend>Color Palette</legend>
                  <div className="color-row">
                    {(["primary", "secondary", "background"] as const).map(
                      (key) => (
                        <div key={key} className="color-picker">
                          <label className="swatch-input" title={key}>
                            <input
                              type="color"
                              className="swatch"
                              value={config?.colors[key] || "#000000"}
                              onChange={(e) => updateColor(key, e.target.value)}
                            />
                            <input
                              className="color-input-text"
                              type="text"
                              value={config?.colors?.[key] || ""}
                              onChange={(e) => updateColor(key, e.target.value)}
                            />
                          </label>
                          <div className="label">{key}</div>
                        </div>
                      )
                    )}
                  </div>
                </fieldset>

                {/* Text Blocks */}
                <fieldset>
                  <legend>Text Block 1</legend>
                  <input
                    type="text"
                    value={config?.text?.[0]?.value || ""}
                    onChange={(e) => {
                      const newText = [...(config?.text || [])];
                      newText[0] = { ...newText[0], value: e.target.value };
                      updateField("text", newText);
                    }}
                  />
                </fieldset>

                <fieldset>
                  <legend>Text Block 2</legend>
                  <input
                  type="text"
                  value={
                    config?.text?.[1]?.id === "footer"
                    ? ""
                    : config?.text?.[1]?.value || ""
                  }
                  onChange={(e) => {
                    const newText = [...(config?.text || [])];
                    // Only update if not footer
                    if (newText[1]?.id !== "footer") {
                    newText[1] = { ...newText[1], value: e.target.value };
                    updateField("text", newText);
                    }
                  }}
                  />
                </fieldset>

                {config?.text?.some((t) => t.id === "footer") && (
                  <fieldset>
                    <legend>Footer Text</legend>
                    <input
                      type="text"
                      value={
                        config?.text?.find((t) => t.id === "footer")?.value || ""
                      }
                      onChange={(e) => {
                        const newText = [...(config?.text || [])];
                        const idx = newText.findIndex((t) => t.id === "footer");
                        if (idx !== -1) {
                          newText[idx] = { ...newText[idx], value: e.target.value };
                          updateField("text", newText);
                        }
                      }}
                    />
                  </fieldset>
                )}
              </div>

              {/* Right Column */}
              <div className="col right">
                {/* Header Image */}
                <fieldset>
                    <legend>Header Image</legend>
                    <div className="image-container">
                    {"header_image" in (config || {}) ? (
                      config?.header_image ? (
                      <img src={config.header_image} alt="Header" />
                      ) : (
                      <div className="placeholder">No image</div>
                      )
                    ) : (
                      <div className="placeholder">
                      This template doesn't support header_image.
                      </div>
                    )}
                    {"header_image" in (config || {}) && (
                      <input
                      className="file-input"
                      type="file"
                      accept="image/*"
                      disabled={uploading}
                      onChange={handleHeaderUpload}
                      />
                    )}
                    </div>
                </fieldset>

                {/* Footer Text */}
                {/* <fieldset>
                <legend>Footer Text</legend>
                <input
                  type="text"
                  value={config?.footer || ""}
                  onChange={(e) => updateField("footer", e.target.value)}
                />
              </fieldset> */}

                {/* Actions */}
                <div className="actions">
                  <button
                    className="btn save"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    Save All Changes
                  </button>
                  <button className="btn delete" onClick={handleDelete}>
                    Delete Template
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "sections" && (
            <div className="tab-content two-col">
              {/* Left: Add / Upload */}
              <div className="col left">
                <fieldset>
                  <legend>
                    {editingSectionIdx !== null
                      ? "Edit Section"
                      : "Add New Section"}
                  </legend>
                  <div className="add-row">
                    <input
                      type="text"
                      placeholder="Section name"
                      value={newSectionName}
                      onChange={(e) => setNewSectionName(e.target.value)}
                    />
                    <button
                      onClick={
                        editingSectionIdx !== null
                          ? handleUpdateSection
                          : handleAddSection
                      }
                    >
                      {editingSectionIdx !== null ? "Update" : "Add"}
                    </button>
                  </div>
                </fieldset>

                <fieldset>
                  <legend>Section Image</legend>
                  <div className="image-container">
                    {sectionImagePreview ? (
                      <img src={sectionImagePreview} />
                    ) : (
                      <div className="placeholder">
                        Section image not available for this menu
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSectionImageUpload}
                    />
                  </div>
                </fieldset>
              </div>

              {/* Right: List of Sections */}
              <div className="col right">
                <fieldset>
                  <legend>Sections</legend>
                  <ul className="item-list">
                    {config!.sections.map((sec, idx) => (
                      <li key={sec.id}>
                        <span>{sec.name}</span>
                        <div className="actions">
                          <button
                            onClick={() => {
                              // start editing this one:
                              setEditingSectionIdx(idx);
                              setNewSectionName(sec.name);
                              // setSectionImagePreview(sec.image || null);
                              // switch back to the left column UI:
                              setActiveTab("sections");
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleRemoveSection(idx)}
                          >
                            ×
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </fieldset>
                <div className="actions-bottom">
                  <button className="btn save" onClick={handleSave}>
                    Save All Changes
                  </button>
                  <button className="btn delete" onClick={handleDeleteSections}>
                    Delete All Sections
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "items" && (
            <div className="tab-content two-col">
              {/* Left: Choose section + add item */}
              <div className="col left">
                <fieldset>
                  <legend>Select Section</legend>
                  <select
                    value={selectedSectionIdx}
                    onChange={(e) => setSelectedSectionIdx(+e.target.value)}
                  >
                    {config!.sections.map((sec, idx) => (
                      <option key={sec.id} value={idx}>
                        {sec.name}
                      </option>
                    ))}
                  </select>
                </fieldset>

                <fieldset>
                  <legend>
                    {editingItemIdx !== null ? "Edit Item" : "Add New Item"}
                  </legend>{" "}
                    <div className="add-row two-rows">
                      {/* First row: name + price */}
                      <div className="row">
                        <input
                          type="text"
                          placeholder="Item name"
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Price"
                          value={newItemPrice}
                          onChange={(e) => setNewItemPrice(e.target.value)}
                        />
                      </div>
                      {/* Second row: description + subtext + calories + image */}
                      <div className="row">
                        {/* Description */}
                        {"description" in (config!.sections[selectedSectionIdx].items[0] || {}) && (
                          <input
                            type="text"
                            placeholder="Description"
                            value={
                              editingItemIdx !== null
                                ? config!.sections[selectedSectionIdx].items[editingItemIdx]?.description || ""
                                : ""
                            }
                            onChange={(e) => {
                              if (editingItemIdx !== null) {
                                setConfig((c) => {
                                  if (!c) return c;
                                  const secs = [...c.sections];
                                  const sec = { ...secs[selectedSectionIdx] };
                                  const items = [...sec.items];
                                  items[editingItemIdx] = {
                                    ...items[editingItemIdx],
                                    description: e.target.value,
                                  };
                                  sec.items = items;
                                  secs[selectedSectionIdx] = sec;
                                  return { ...c, sections: secs };
                                });
                              }
                            }}
                          />
                        )}
                        {/* Subtext */}
                        {"subtext" in (config!.sections[selectedSectionIdx].items[0] || {}) && (
                          <input
                            type="text"
                            placeholder="Subtext"
                            value={
                              editingItemIdx !== null
                                ? config!.sections[selectedSectionIdx].items[editingItemIdx]?.subText || ""
                                : ""
                            }
                            onChange={(e) => {
                              if (editingItemIdx !== null) {
                                setConfig((c) => {
                                  if (!c) return c;
                                  const secs = [...c.sections];
                                  const sec = { ...secs[selectedSectionIdx] };
                                  const items = [...sec.items];
                                  items[editingItemIdx] = {
                                    ...items[editingItemIdx],
                                    subText: e.target.value,
                                  };
                                  sec.items = items;
                                  secs[selectedSectionIdx] = sec;
                                  return { ...c, sections: secs };
                                });
                              }
                            }}
                          />
                        )}
                        {/* Calories */}
                        {"calories" in (config!.sections[selectedSectionIdx].items[0] || {}) && (
                          <input
                            type="text"
                            placeholder="Calories"
                            value={
                              editingItemIdx !== null
                                ? config!.sections[selectedSectionIdx].items[editingItemIdx]?.calories || ""
                                : ""
                            }
                            onChange={(e) => {
                              if (editingItemIdx !== null) {
                                setConfig((c) => {
                                  if (!c) return c;
                                  const secs = [...c.sections];
                                  const sec = { ...secs[selectedSectionIdx] };
                                  const items = [...sec.items];
                                  items[editingItemIdx] = {
                                    ...items[editingItemIdx],
                                    calories: e.target.value,
                                  };
                                  sec.items = items;
                                  secs[selectedSectionIdx] = sec;
                                  return { ...c, sections: secs };
                                });
                              }
                            }}
                          />
                        )}
                        {/* Image */}
                        {"imageUrl" in (config!.sections[selectedSectionIdx].items[0] || {}) && (
                          <input
                            type="text"
                            placeholder="Image URL"
                            value={
                              editingItemIdx !== null
                                ? config!.sections[selectedSectionIdx].items[editingItemIdx]?.image || ""
                                : ""
                            }
                            onChange={(e) => {
                              if (editingItemIdx !== null) {
                                setConfig((c) => {
                                  if (!c) return c;
                                  const secs = [...c.sections];
                                  const sec = { ...secs[selectedSectionIdx] };
                                  const items = [...sec.items];
                                  items[editingItemIdx] = {
                                    ...items[editingItemIdx],
                                    image: e.target.value,
                                  };
                                  sec.items = items;
                                  secs[selectedSectionIdx] = sec;
                                  return { ...c, sections: secs };
                                });
                              }
                            }}
                          />
                        )}
                        <button
                          onClick={
                            editingItemIdx !== null
                              ? handleUpdateItem
                              : handleAddItem
                          }
                        >
                          {editingItemIdx !== null ? "Update" : "Add"}
                        </button>
                      </div>
                    </div>
                </fieldset>

                {("image" in (config!.sections[selectedSectionIdx].items[0] || {})) ? (
                  <fieldset>
                  <legend>Item Image</legend>
                  <div className="image-container">
                    {editingItemIdx !== null && config!.sections[selectedSectionIdx].items[editingItemIdx]?.image ? (
                    <img
                      src={config!.sections[selectedSectionIdx].items[editingItemIdx].image}
                      alt="Item"
                    />
                    ) : itemImagePreview ? (
                    <img src={itemImagePreview} alt="Preview" />
                    ) : null}
                    <input
                    type="file"
                    accept="image/*"
                    onChange={handleItemImageUpload}
                    />
                    <input
                    type="text"
                    placeholder="No image selected yet."
                    value={
                      editingItemIdx !== null
                      ? config!.sections[selectedSectionIdx].items[editingItemIdx]?.image || ""
                      : ""
                    }
                    onChange={(e) => {
                      if (editingItemIdx !== null) {
                      setConfig((c) => {
                        if (!c) return c;
                        const secs = [...c.sections];
                        const sec = { ...secs[selectedSectionIdx] };
                        const items = [...sec.items];
                        items[editingItemIdx] = {
                        ...items[editingItemIdx],
                        image: e.target.value,
                        };
                        sec.items = items;
                        secs[selectedSectionIdx] = sec;
                        return { ...c, sections: secs };
                      });
                      }
                    }}
                    />
                  </div>
                  </fieldset>
                ) : (
                  <fieldset>
                  <legend>Item Image</legend>
                  <p>This template doesn't support item images.</p>
                  </fieldset>
                )}
              </div>

              {/* Right: List of items in that section */}
              <div className="col right">
                <fieldset>
                  <legend>
                  Items in “{config!.sections[selectedSectionIdx].name}”
                  </legend>
                  <ul className="item-list">
                  {config!.sections[selectedSectionIdx].items.map(
                    (it, idx) => (
                    <li key={it.id} style={{ display: "flex", alignItems: "center" }}>
                      {/* Thumbnail */}
                      <div
                      style={{
                        width: 20,
                        height: 20,
                        marginRight: 5,
                        borderRadius: 2,
                        background: "#eee",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        border: "1px solid #ccc",
                      }}
                      >
                      {it.image ? (
                        <img
                        src={it.image}
                        alt={it.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        />
                      ) : (
                        <div
                        style={{
                          width: "100%",
                          height: "100%",
                          background: "#ccc",
                        }}
                        />
                      )}
                      </div>
                      <span>
                      {it.name} — SAR {it.price}
                      </span>
                      <div className="actions" style={{ marginLeft: "auto" }}>
                      <button
                        onClick={() => {
                        setEditingItemIdx(idx);
                        setNewItemName(it.name);
                        setNewItemPrice(it.price);
                        // setItemImagePreview(it.imageUrl || null);
                        setActiveTab("items");
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleRemoveItem(idx)}
                      >
                        ×
                      </button>
                      </div>
                    </li>
                    )
                  )}
                  </ul>
                </fieldset>

                <div className="actions-bottom">
                  <button className="btn save" onClick={handleSave}>
                    Save All Changes
                  </button>
                  <button className="btn delete" onClick={handleDeleteAllItems}>
                    Delete All Items
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default HeaderImageBuilder;
