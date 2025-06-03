import { useState } from "react";
import { Section } from "../../api/templates";
import { useParams } from "react-router-dom";
import "../../styles/templateBuilder.scss";
import { API_URL } from "../../api/api";

type Props = {
  sections: Section[];
  focusedIndex: number;
  onFocusChange: (idx: number) => void;
  onChange: (newSections: Section[]) => void;
};

export default function SectionsForm({
  sections,
  focusedIndex,
  onFocusChange,
  onChange,
}: Props) {
  const { id } = useParams<{ id: string }>();

  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleUpdate = () => {
    if (editingIdx === null) return;
    const updated = sections.map((sec, idx) =>
      idx === editingIdx
        ? { ...sec, name: newName, image: imagePreview ?? sec.image }
        : sec
    );
    onChange(updated);
    setEditingIdx(null);
    setNewName("");
    setImagePreview(null);
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    const next: Section = {
      id: crypto.randomUUID(),
      name: newName,
      items: [],
      //   image: imagePreview || undefined,
    };
    onChange([...sections, next]);
    // reset form
    setNewName("");
    setImagePreview(null);
  };

  // inside SectionsForm
const handleSectionImageUpload = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0];
  if (!file || editingIdx === null) return;

  // show quick preview
  setImagePreview(URL.createObjectURL(file));

  // now upload
  const form = new FormData();
  form.append("image_url", file);
  form.append("sectionId", sections[editingIdx].id);

  const res = await fetch(`${API_URL}/templates/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
    body: form,
  });
  const body = await res.json();
  if (!res.ok) {
    alert("Upload failed: " + body.error);
    return;
  }

  // replace preview+in‐memory with the real URL
  setImagePreview(null);
  onChange(body.config.sections);
};


  const handleRemove = (idxToRemove: number) => {
    onChange(sections.filter((_, idx) => idx !== idxToRemove));
    // adjust focus if needed
    if (focusedIndex === idxToRemove) {
      onFocusChange(0);
    } else if (focusedIndex > idxToRemove) {
      onFocusChange(focusedIndex - 1);
    }
  };

  return (
    <div className="tab-content two-col">
      {/* Left: Add / Upload */}
      <div className="col left">
        <fieldset>
          <legend>
            {editingIdx !== null ? "Edit Section" : "Add New Section"}
          </legend>
          <div className="add-row">
            <input
              type="text"
              placeholder="Section name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button onClick={editingIdx !== null ? handleUpdate : handleAdd}>
              {editingIdx !== null ? "Update" : "Add"}
            </button>
          </div>
        </fieldset>

        <fieldset>
          <legend>Section Image</legend>
          <div className="image-container">
            {imagePreview ? (
              <img src={imagePreview} />
            ) : (
              <div className="placeholder">
                Section image not available for this menu
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleSectionImageUpload} />
          </div>
        </fieldset>
      </div>

      {/* Right: List of Sections */}
      <div className="col right">
        <fieldset>
          <legend>Sections</legend>
          <ul className="item-list">
            {sections.map((sec, idx) => (
              <li
                key={sec.id}
                className={idx === focusedIndex ? "focused" : ""}
              >
                <span
                  onClick={() => onFocusChange(idx)}
                  style={{ cursor: "pointer" }}
                >
                  {sec.name}
                </span>
                <div className="actions">
                  <button
                    onClick={() => {
                      setEditingIdx(idx);
                      setNewName(sec.name);
                      setImagePreview(sec.image || null);
                    }}
                  > 
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleRemove(idx)}
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </fieldset>
      </div>
    </div>
  );
}
