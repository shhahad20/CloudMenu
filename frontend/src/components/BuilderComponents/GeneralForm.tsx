import { useState } from "react";
import { TemplateConfig } from "../../api/templates";
import { API_URL } from "../../api/api";
import { useParams } from "react-router-dom";
import "../../styles/templateBuilder.scss";

type Props = {
  general: TemplateConfig;
  onChange: (updates: Partial<TemplateConfig>) => void;
};

export default function GeneralForm({ general, onChange }: Props) {
  const { id } = useParams<{ id: string }>();

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = <K extends keyof TemplateConfig>(
    key: K,
    value: TemplateConfig[K]
  ) => {
    onChange({ [key]: value } as Partial<TemplateConfig>);
  };

  const updateColor = (
    colorKey: keyof TemplateConfig["colors"],
    value: string
  ) => {
    onChange({
      colors: {
        ...general.colors,
        [colorKey]: value,
      },
    });
  };
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
      onChange({ header_image: body.config.header_image });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Image upload failed: ${err.message}`);
        console.log("Image upload error:", error);
      } else {
        setError("Image upload failed: An unknown error occurred.");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="tab-content general">
      <div className="general-form">
        {/* Left Column */}
        <div className="col left">
          {/* Logo */}
          <fieldset className="form-fieldset">
            <legend>Logo</legend>
            <input
              type="text"
              value={general?.logo || ""}
              onChange={(e) => updateField("logo", e.target.value)}
              placeholder="Logo URL or name"
              className="form-input"
            />
            {general?.logo && general.logo.startsWith("http") ? (
              <div className="logo-image-container">
                {general.logo ? (
                  <img src={general.logo} alt="Logo" className="logo-preview" />
                ) : (
                  <div className="placeholder">No logo image</div>
                )}
                <input
                  className="file-input"
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onClick={(e) => {
                    if (!general.logo || !general.logo.startsWith("http")) {
                      e.preventDefault();
                    }
                  }}
                />
              </div>
            ) : (
              <div className="warning-message">
                ⚠️ Image upload only allowed if logo is an image URL.
              </div>
            )}
          </fieldset>

          {/* Colors */}
          <fieldset className="form-fieldset">
            <legend>Color Palette</legend>
            <div className="color-row">
              {(["primary", "secondary", "background"] as const).map((key) => (
                <div key={key} className="color-picker">
                  <label className="swatch-input" title={key}>
                    <input
                      type="color"
                      className="swatch"
                      value={general?.colors[key] || "#000000"}
                      onChange={(e) => updateColor(key, e.target.value)}
                    />
                    <input
                      className="color-input-text"
                      type="text"
                      value={general?.colors?.[key] || ""}
                      onChange={(e) => updateColor(key, e.target.value)}
                      placeholder="#000000"
                    />
                  </label>
                  <div className="label">{key}</div>
                </div>
              ))}
            </div>
          </fieldset>

          {/* Text Blocks */}
          <fieldset className="form-fieldset">
            <legend>Text Block 1</legend>
            <input
              type="text"
              value={general?.text?.[0]?.value || ""}
              onChange={(e) => {
                const newText = [...(general?.text || [])];
                newText[0] = { ...newText[0], value: e.target.value };
                updateField("text", newText);
              }}
              placeholder="Enter text for block 1"
              className="form-input"
            />
          </fieldset>

          <fieldset className="form-fieldset">
            <legend>Text Block 2</legend>
            <input
              type="text"
              value={
                general?.text?.[1]?.id === "footer"
                  ? ""
                  : general?.text?.[1]?.value || ""
              }
              onChange={(e) => {
                const newText = [...(general?.text || [])];
                // Only update if not footer
                if (newText[1]?.id !== "footer") {
                  newText[1] = { ...newText[1], value: e.target.value };
                  updateField("text", newText);
                }
              }}
              placeholder="Enter text for block 2"
              disabled={general?.text?.[1]?.id === "footer"}
              className={`form-input ${
                general?.text?.[1]?.id === "footer" ? "disabled" : ""
              }`}
            />
          </fieldset>

          {general?.text?.some((t) => t.id === "footer") && (
            <fieldset className="form-fieldset">
              <legend>Footer Text</legend>
              <input
                type="text"
                value={
                  general?.text?.find((t) => t.id === "footer")?.value || ""
                }
                onChange={(e) => {
                  const newText = [...(general?.text || [])];
                  const idx = newText.findIndex((t) => t.id === "footer");
                  if (idx !== -1) {
                    newText[idx] = {
                      ...newText[idx],
                      value: e.target.value,
                    };
                    updateField("text", newText);
                  }
                }}
                placeholder="Enter footer text"
                className="form-input"
              />
            </fieldset>
          )}
        </div>

        {/* Right Column */}
        <div className="col right">
          {/* Header Image */}
          <fieldset className="form-fieldset">
            <legend>Header Image</legend>
            <div className="image-container">
              {"header_image" in (general || {}) ? (
                <div className="header-image-section">
                  <div className="image-preview">
                    {general?.header_image ? (
                      <img
                        src={general.header_image}
                        alt="Header"
                        className="header-preview"
                      />
                    ) : (
                      <div className="placeholder">
                        <div className="placeholder-icon">📸</div>
                        No image uploaded
                      </div>
                    )}
                  </div>
                  <div className="upload-section">
                    <input
                      className="file-input"
                      type="file"
                      accept="image/*"
                      disabled={uploading}
                      onChange={handleHeaderUpload}
                    />
                    {uploading && (
                      <div className="upload-status">
                        <div className="spinner"></div>
                        <span>Uploading...</span>
                      </div>
                    )}
                    {error && <div className="error-message">{error}</div>}
                  </div>
                </div>
              ) : (
                <div className="placeholder not-supported">
                  <div className="placeholder-icon">🚫</div>
                  This template doesn't support header_image.
                </div>
              )}
            </div>
          </fieldset>
        </div>
      </div>
    </div>
  );
}
