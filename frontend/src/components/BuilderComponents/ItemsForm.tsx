import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Section } from "../../api/templates";
import { API_URL } from "../../api/api";
// import { API_URL } from "../../api/api";
import "../../styles/templateBuilder.scss";

type Props = {
  sectionId: string;
  sectionIndex: number;
  items: Section["items"];
  onChange: (newItems: Section["items"]) => void;
};

export default function ItemsForm({ sectionId, items, onChange }: Props) {
  const { id } = useParams<{ id: string }>();
  //   const navigate = useNavigate();

  // local form state
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newSubText, setNewSubText] = useState("");
  const [newCalories, setNewCalories] = useState("");
  //   const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  const [localPreview, setLocalPreview] = useState<string | null>(null);

  // loading/UI flags
  //   const [saving, setSaving]   = useState(false);
  //   const [deleting, setDeleting] = useState(false);
  //   const [error, setError]     = useState<string | null>(null);
  // reset form fields
  const resetForm = () => {
    setEditingIdx(null);
    setNewName("");
    setNewPrice("");
    setNewDescription("");
    setNewSubText("");
    setNewCalories("");
    setImageUrl(""); // Reset to empty string instead of undefined
    setLocalPreview(null);
  };

  // add new item
  const handleAddItem = () => {
    if (!newName.trim()) return;
    const imageValue = imageUrl;
    const next = {
      id: crypto.randomUUID(),
      name: newName,
      price: Number(newPrice),
      ...(newDescription && { description: newDescription }),
      ...(newSubText && { subText: newSubText }),
      ...(newCalories && { calories: newCalories }),
      ...(imageValue ? { image: imageValue } : {}),
    };
    onChange([...items, next]);
    resetForm();
  };

  // update existing
  const handleUpdateItem = () => {
    if (editingIdx === null) return;
    const updated = items.map((it, idx) => {
      console.log("update image :", imageUrl);
      if (idx !== editingIdx) return it;
      return {
        ...it,
        name: newName,
        price: Number(newPrice),
        ...("description" in it && { description: newDescription }),
        ...("subText" in it && { subText: newSubText }),
        ...("calories" in it && { calories: newCalories }),
        image: imageUrl ?? it.image,
      };
    });
    onChange(updated);
    resetForm();
  };

  // remove single
  const handleRemoveItem = (idxToRemove: number) => {
    onChange(items.filter((_, i) => i !== idxToRemove));
  };

  const handleItemImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || editingIdx === null) return;

    // 1) instant UI feedback
    const blob = URL.createObjectURL(file);
    setLocalPreview(blob);

    try {
      // 2) upload
      const form = new FormData();
      form.append("image_url", file);
      form.append("sectionId", sectionId);
      form.append("itemId", items[editingIdx].id);

      console.log(
        "Uploading file:",
        file.name,
        "for item:",
        items[editingIdx].id
      );

      const res = await fetch(`${API_URL}/templates/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: form,
      });

      const body = await res.json();

      // Debug: Log the entire response
      console.log("Full server response:", body);

      if (!res.ok) {
        alert("Upload failed: " + (body.error || res.statusText));
        URL.revokeObjectURL(blob);
        setLocalPreview(null);
        return;
      }

      // Debug: Log the sections data
      console.log("Sections from response:", body.config?.sections);

      // Find the section and item
      const section = body.config?.sections?.find(
        (s: Section) => s.id === sectionId
      );
      console.log("Found section:", section);

      if (!section) {
        console.error("Section not found in response");
        alert("Error: Section not found in server response");
        URL.revokeObjectURL(blob);
        setLocalPreview(null);
        return;
      }

      const updatedItem = section.items?.[editingIdx];
      console.log("Updated item from server:", updatedItem);

      const serverImageUrl = updatedItem?.image;
      console.log("Server image URL:", serverImageUrl);

      // Check if the URL is still a blob URL (which shouldn't happen)
      if (serverImageUrl?.startsWith("blob:")) {
        console.error(
          "Server returned a blob URL - this indicates a server-side issue"
        );
        alert("Server error: Image was not properly uploaded to storage");
        URL.revokeObjectURL(blob);
        setLocalPreview(null);
        return;
      }

      if (!serverImageUrl) {
        console.error("No image URL returned from server");
        alert("Error: No image URL returned from server");
        URL.revokeObjectURL(blob);
        setLocalPreview(null);
        return;
      }

      // Update the items array with the server URL
      const updatedItems = items.map((item, idx) => {
        if (idx === editingIdx) {
          return { ...item, image: serverImageUrl };
        }
        return item;
      });

      // Update the parent component's items state
      onChange(updatedItems);

      // Clean up blob URL and preview first
      URL.revokeObjectURL(blob);
      setLocalPreview(null);

      // Then set the imageUrl
      setImageUrl(serverImageUrl);

      console.log(
        "Image upload completed successfully with URL:",
        serverImageUrl
      );
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed: " + error);
      URL.revokeObjectURL(blob);
      setLocalPreview(null);
    }
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
              onChange={(e) => setNewName(e.target.value)}
            />
            <input
              type="number"
              placeholder="Price"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
            />
          </div>

          <div className="row">
            {"description" in (items[0] || {}) && (
              <input
                type="text"
                placeholder="Description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            )}
            {"subText" in (items[0] || {}) && (
              <input
                type="text"
                placeholder="Subtext"
                value={newSubText}
                onChange={(e) => setNewSubText(e.target.value)}
              />
            )}
            {"calories" in (items[0] || {}) && (
              <input
                type="text"
                placeholder="Calories"
                value={newCalories}
                onChange={(e) => setNewCalories(e.target.value)}
              />
            )}
          </div>

          <fieldset>
            <legend>Item Image</legend>
            <div className="image-container">
              {/* show local preview if present, otherwise saved URL, otherwise existing item image, otherwise placeholder */}
              {localPreview ? (
                <img src={localPreview} alt="Local preview" />
              ) : imageUrl ? (
                <img src={imageUrl} alt="Saved" />
              ) : editingIdx !== null && items[editingIdx]?.image ? (
                <img src={items[editingIdx].image} alt="Existing" />
              ) : (
                <div className="placeholder">No image selected</div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleItemImageUpload}
              />
            </div>
          </fieldset>

          <button
            className="item-add-btn"
            onClick={editingIdx !== null ? handleUpdateItem : handleAddItem}
          >
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
                    className="thumbnail"
                    style={{
                      width: 60,
                      height: 40,
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
                        className="thumbnail-image"
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
                  <div>
                    <strong>{it.name}</strong> — SAR {it.price}
                    {it.subText && <div className="subtext">{it.subText}</div>}
                    {it.description && (
                      <div className="desc">{it.description}</div>
                    )}
                    {it.calories && (
                      <div className="cal">{it.calories} cal</div>
                    )}
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
                        setImageUrl(it.image || ""); // Set imageUrl instead of localPreview
                        setLocalPreview(null); // Clear any local preview
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
                </div>
              </li>
            ))}
          </ul>
        </fieldset>
      </div>
    </div>
  );
}
