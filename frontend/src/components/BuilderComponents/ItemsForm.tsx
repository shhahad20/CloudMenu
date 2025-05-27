import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Section } from "../../api/templates";
import { API_URL } from "../../api/api";
// import { API_URL } from "../../api/api";

type Props = {
 sectionId: string;                  
  sectionIndex: number;         
  items: Section["items"];
  onChange: (newItems: Section["items"]) => void;
};

export default function ItemsForm({
  sectionId,
  items,
  onChange,
}: Props) {
  const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();

  // local form state
  const [editingIdx, setEditingIdx]     = useState<number | null>(null);
  const [newName, setNewName]           = useState("");
  const [newPrice, setNewPrice]         = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newSubText, setNewSubText]     = useState("");
  const [newCalories, setNewCalories]   = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile]       = useState<File | null>(null);

  // loading/UI flags
//   const [saving, setSaving]   = useState(false);
//   const [deleting, setDeleting] = useState(false);
//   const [error, setError]     = useState<string | null>(null);
console.log("Image file: " + imageFile)
  // reset form fields
  const resetForm = () => {
    setEditingIdx(null);
    setNewName("");
    setNewPrice("");
    setNewDescription("");
    setNewSubText("");
    setNewCalories("");
    setImagePreview(null);
    setImageFile(null);
  };

  // add new item
  const handleAddItem = () => {
    if (!newName.trim()) return;
    const next = {
      id:          crypto.randomUUID(),
      name:        newName,
      price:       newPrice,
      ...(newDescription  && { description: newDescription }),
      ...(newSubText     && { subText: newSubText }),
      ...(newCalories   && { calories: newCalories }),
      ...(imagePreview   && { image: imagePreview }),
    };
    onChange([...items, next]);
    resetForm();
  };

  // update existing
  const handleUpdateItem = () => {
    if (editingIdx === null) return;
    const updated = items.map((it, idx) => {
      if (idx !== editingIdx) return it;
      return {
        ...it,
        name:        newName,
        price:       newPrice,
        ...( "description" in it && { description: newDescription }),
        ...( "subText"     in it && { subText: newSubText }),
        ...( "calories"    in it && { calories: newCalories }),
        image:       imagePreview ?? it.image,
      };
    });
    onChange(updated);
    resetForm();
  };

  // remove single
  const handleRemoveItem = (idxToRemove: number) => {
    onChange(items.filter((_, i) => i !== idxToRemove));
  };

//   // delete all
//   const handleDeleteAllItems = async () => {
//     if (!window.confirm("Delete ALL items? This cannot be undone.")) return;
//     setDeleting(true);
//     setError(null);
//     onChange([]);
//     try {
//       const res = await fetch(`${API_URL}/templates/${id}`, {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization:  `Bearer ${localStorage.getItem("access_token")}`,
//         },
//         body: JSON.stringify({ config: { sections: [{ items: [] }] } }),
//       });
//       if (!res.ok) throw new Error(await res.text());
//       alert("All items deleted");
//       navigate(`/menus/${id}`, { replace: true });
//     } catch (e: unknown) {
//       const message = e instanceof Error ? e.message : String(e);
//       setError(`Delete failed: ${message}`);
//     } finally {
//       setDeleting(false);
//     }
//   };

//   // save items to server
//   const handleSaveItems = async () => {
//     setSaving(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_URL}/templates/${id}`, {
//         method: "PATCH",
//         headers: {
//           "Content-Type":  "application/json",
//           Authorization:   `Bearer ${localStorage.getItem("access_token")}`,
//         },
//         body: JSON.stringify({ config: { sections: [{ items }] } }),
//       });
//       if (!res.ok) throw new Error(await res.text());
//       alert("Items saved successfully!");
//     } catch (e: unknown) {
//       const message = e instanceof Error ? e.message : String(e);
//       setError(`Save failed: ${message}`);
//     } finally {
//       setSaving(false);
//     }
//   };

  // handle file input + preview
//   const handleItemImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0] ?? null;
//     if (!file) return;
//     setImagePreview(URL.createObjectURL(file));
//     setImageFile(file);
//   };

const handleItemImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] ?? null;
    if (!file || editingIdx === null) return;

    // show local preview
    setImagePreview(URL.createObjectURL(file));

    // build FormData for immediate upload
    const form = new FormData();
    form.append("image_url", file);           // matches your multer field
    form.append("sectionId", sectionId);      // from props
    form.append("itemId", items[editingIdx].id);

    // call backend
    const res = await fetch(`${API_URL}/templates/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: form,
    });

    const body = await res.json();
    if (!res.ok) {
      alert("Upload failed: " + (body.error || res.statusText));
      return;
    }

    // server returns updated config, grab the new items for this section:
    const newItems = body.config.sections
      .find((sec: Section) => sec.id === sectionId)!
      .items;

    // clear preview & update parent state
    setImagePreview(null);
    onChange(newItems);
  };


  return (
    <div className="tab-content two-col">
      {/* Left: Add / Edit Form */}
      <div className="col left">
        <fieldset>
          <legend>{editingIdx !== null ? "Edit Item" : "Add New Item"}</legend>
          <div className="row">
            <input
              type="text"
              placeholder="Name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Price"
              value={newPrice}
              onChange={e => setNewPrice(e.target.value)}
            />
          </div>

          <div className="row">
            {"description" in (items[0] || {}) && (
              <input
                type="text"
                placeholder="Description"
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
              />
            )}
            {"subText" in (items[0] || {}) && (
              <input
                type="text"
                placeholder="Subtext"
                value={newSubText}
                onChange={e => setNewSubText(e.target.value)}
              />
            )}
            {"calories" in (items[0] || {}) && (
              <input
                type="text"
                placeholder="Calories"
                value={newCalories}
                onChange={e => setNewCalories(e.target.value)}
              />
            )}
          </div>

          <fieldset>
            <legend>Item Image</legend>
            <div className="image-container">
              {editingIdx !== null && items[editingIdx]?.image ? (
                <img src={items[editingIdx].image} alt="Item" />
              ) : imagePreview ? (
                <img src={imagePreview} alt="Preview" />
              ) : (
                <div className="placeholder">No image selected</div>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handleItemImageUpload} />
          </fieldset>

          <button onClick={editingIdx !== null ? handleUpdateItem : handleAddItem}>
            {editingIdx !== null ? "Update Item" : "Add Item"}
          </button>
        </fieldset>
      </div>

      {/* Right: List + Actions */}
      <div className="col right">
        <fieldset>
          <legend>Items ({items.length})</legend>
          <ul className="item-list">
            {items.map((it, idx) => (
              <li key={it.id}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      marginRight: 8,
                      borderRadius: 4,
                      overflow: "hidden",
                      background: "#eee",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {it.image ? (
                      <img
                        src={it.image}
                        alt={it.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "#ccc" }} />
                    )}
                  </div>
                  <div>
                    <strong>{it.name}</strong> — SAR {it.price}
                    {it.subText && <div className="subtext">{it.subText}</div>}
                    {it.description && <div className="desc">{it.description}</div>}
                    {it.calories && <div className="cal">{it.calories} cal</div>}
                  </div>
                  <div className="actions" style={{ marginLeft: "auto" }}>
                    <button
                      onClick={() => {
                        setEditingIdx(idx);
                        setNewName(it.name);
                        setNewPrice(it.price);
                        setNewDescription(it.description || "");
                        setNewSubText(it.subText || "");
                        setNewCalories(it.calories || "");
                        setImagePreview(it.image || null);
                      }}
                    >
                      Edit
                    </button>
                    <button className="delete-btn" onClick={() => handleRemoveItem(idx)}>
                      ×
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* <div className="actions-bottom">
            <button className="btn save" onClick={handleSaveItems} disabled={saving}>
              {saving ? "Saving…" : "Save All Items"}
            </button>
            <button className="btn delete" onClick={handleDeleteAllItems} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete All Items"}
            </button>
          </div>

          {error && <p className="error">{error}</p>} */}
        </fieldset>
      </div>
    </div>
  );
}
