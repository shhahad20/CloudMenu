import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTemplate } from "../api/templates";
import { API_URL } from "../api/api";
import { TemplateConfig, Section } from "../api/templates";
import "../styles/templateBuilder.scss";

const HeaderImageBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  // const [currentUrl, setCurrentUrl] = useState<string | undefined>();
  const [config, setConfig] = useState<TemplateConfig | null>(null);
  const [saving, setSaving] = useState(false);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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

  const updateSection = (idx: number, section: Section) => {
    if (!config) return;
    const newSections = [...(config.sections || [])];
    newSections[idx] = section;
    updateField("sections", newSections);
  };

  const addSection = () => {
    setConfig((c) =>
      c
        ? {
            ...c,
            sections: [
              ...c.sections,
              { id: crypto.randomUUID(), name: "", items: [] },
            ],
          }
        : c
    );
  };

  const removeSection = (idx: number) => {
    setConfig((c) =>
      c
        ? {
            ...c,
            sections: c.sections.filter((_, i) => i !== idx),
          }
        : c
    );
  };

  // const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;
  //   setUploading(true);
  //   setError(null);

  //   const form = new FormData();
  //   form.append("image_url", file);     // must match uploadMiddleware key

  //   try {
  //     const res = await fetch(
  //       `${API_URL}/templates/${id}`,
  //       {
  //         method: "PATCH",
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("access_token")}`
  //           // note: NO Content-Type header here
  //         },
  //         body: form
  //       }
  //     );
  //     if (!res.ok) throw res;
  //     const { config } = await res.json();
  //     setCurrentUrl(config.header_image);
  //   } catch {
  //     setError("Upload failed. Try again.");
  //   } finally {
  //     setUploading(false);
  //   }
  // };
  // 2) on Save: send updated config

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
      if (!res.ok) throw res;
      const { config: newCfg } = await res.json();
      setConfig(newCfg);
    } catch {
      setError("Image upload failed. Try again.");
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

  if (loading) return <p>Loading…</p>;

  return (
    <div className="builder-container">
      <h1>Edit Template</h1>
      {/* Logo */}
      <fieldset>
        <legend>Logo</legend>
        <div className="logo-container">
          <label></label>
          <input
            type="text"
            value={config?.logo || ""}
            onChange={(e) => updateField("logo", e.target.value)}
          />
        </div>
      </fieldset>
      {/* Colors */}
      <fieldset style={{ marginTop: 14 }}>
        <legend>Colors</legend>
        {(["primary", "secondary", "background"] as const).map((colKey) => (
          <div key={colKey} className="color-picker">
            <label>{colKey}: </label>
            <input
              className="color-input-text"
              type="text"
              value={config?.colors?.[colKey] || ""}
              onChange={(e) => updateColor(colKey, e.target.value)}
              style={{ marginLeft: 8 }}
            />
            <input
              className="color-input "
              type="color"
              value={config?.colors?.[colKey] || ""}
              onChange={(e) => updateColor(colKey, e.target.value)}
            />
          </div>
        ))}
      </fieldset>

      {/* Text */}

      <fieldset style={{ marginBottom: 14 }}>
        <legend>Text Blocks</legend>

        {config?.text?.map((tb, ti) => (
          <div className="text-conatiner" key={tb.id} style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontWeight: 500 }}>
              {tb.label}
            </label>
            <textarea
              rows={2}
              style={{ width: "100%", padding: 8 }}
              value={tb.value}
              onChange={(e) => {
                const newText = [...(config?.text || [])];
                newText[ti] = { ...tb, value: e.target.value };
                updateField("text", newText);
              }}
            />
            {/* <button
              style={{ marginTop: 4 }}
              onClick={() => {
                const filtered = config?.text?.filter((_, i) => i !== ti) || [];
                updateField("text", filtered);
              }}
            >
              Delete
            </button> */}
          </div>
        ))}

        {/* <button
          onClick={() => {
            const id = crypto.randomUUID();
            updateField("text", [
              ...(config?.text || []),
              { id, label: "New Text", value: "" },
            ]);
          }}
        >
          + Add Text Block
        </button> */}
      </fieldset>

      {/* Sections & Items */}
      <fieldset style={{ marginTop: 14 }}>
        <legend>Sections</legend>
        {config?.sections?.map((sec, si) => (
          <div className="t-section-container" key={si}>
            <div className="t-section-header">
              <label>Name: </label>
              <input
                type="text"
                value={sec.name}
                onChange={(e) =>
                  updateSection(si, { ...sec, name: e.target.value })
                }
              />
              <button onClick={() => removeSection(si)}>Delete</button>
            </div>
            <div className="t-section-items">
              <h4>Items</h4>
              {sec.items.map((item, ii) => (
                <div
                  className="t-section-item"
                  key={ii}
                  style={{ marginBottom: 4 }}
                >
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => {
                      const newItems = [...sec.items];
                      newItems[ii] = { ...item, name: e.target.value };
                      updateSection(si, { ...sec, items: newItems });
                    }}
                    placeholder="Item name"
                  />
                  <input
                    className="t-section-item-price"
                    type="number"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => {
                      const price =
                        parseFloat(e.target.value.replace(/[^\d.]/g, "")) || 0;
                      const newItems = [...sec.items];
                      newItems[ii] = {
                        ...item,
                        price: price.toLocaleString("en-US", {
                          useGrouping: false,
                        }),
                      };
                      updateSection(si, { ...sec, items: newItems });
                    }}
                    placeholder="Price"
                    style={{ marginLeft: 8 }}
                  />
                  <button
                    className="t-section-item-delete"
                    onClick={() => {
                      const newItems = sec.items.filter((_, i) => i !== ii);
                      updateSection(si, { ...sec, items: newItems });
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                className="t-section-item-add"
                onClick={() => {
                  updateSection(si, {
                    ...sec,
                    items: [
                      ...sec.items,
                      { id: crypto.randomUUID(), name: "", price: "0" },
                    ],
                  });
                }}
              >
                + Add Item
              </button>
            </div>
          </div>
        ))}
        <button className="add-new-section" onClick={addSection}>
          + Add Section
        </button>
      </fieldset>

      {/* Header Image (you can still reuse your old file uploader) */}
      {/* Header Image */}
      <div className="headerImageSection">
        <h2>Header Image</h2>

        {config?.header_image ? (
          <img src={config.header_image} alt="Header" />
        ) : (
          <p>No header image set.</p>
        )}

        <input
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={handleHeaderUpload}
        />

        {uploading && <p>Uploading…</p>}
      </div>
      {/* …either embed your HeaderImageBuilder here, or replicate the file input logic… */}

      <div style={{ marginTop: 20 }}>
        <button onClick={handleSave} disabled={saving} className="save-button">
          {saving ? "Saving…" : "Save All Changes"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  );
};

export default HeaderImageBuilder;
