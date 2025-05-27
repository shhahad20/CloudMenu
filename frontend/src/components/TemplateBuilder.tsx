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
  // const [currentUrl, setCurrentUrl] = useState<string | undefined>();
  const [config, setConfig] = useState<TemplateConfig>(initialConfig);
  const [saving, setSaving] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>("general");
  const navigate = useNavigate();

  // const [editingSectionIdx, setEditingSectionIdx] = useState<number | null>(
  //   null
  // );
  // const [editingItemIdx, setEditingItemIdx] = useState<number | null>(null);

  const [focusedSectionIdx, setFocusedSectionIdx] = useState(0);

  // tpl => setCurrentUrl(tpl.config.header_image)
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

  // const handleDelete = async () => {
  //   if (!window.confirm("Are you sure you want to delete this template?"))
  //     return;
  //   try {
  //     const res = await fetch(`${API_URL}/templates/${id}`, {
  //       method: "DELETE",
  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  //       },
  //     });
  //     if (!res.ok) throw new Error(await res.text());
  //     alert("Template deleted.");
  //     navigate("/dashboard/menus", { replace: true });
  //   } catch (err: unknown) {
  //     if (err instanceof Error) {
  //       console.error("Delete failed:", err);
  //       alert("Delete failed: " + err.message);
  //     } else {
  //       console.error("Delete failed: Unknown error.");
  //       alert("Delete failed: Unknown error.");
  //     }
  //   }
  // };

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

  // const [selectedSectionIdx, setSelectedSectionIdx] = useState<number>(0);

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
            <GeneralForm general={config} onChange={handleGeneralChange} />
          )}

          {activeTab === "sections" && (
            <SectionsForm
              sections={config.sections}
              focusedIndex={focusedSectionIdx}
              onFocusChange={setFocusedSectionIdx}
              onChange={handleSectionsChange}
            />
          )}

          {activeTab === "items" && (
            // <div className="tab-content two-col">
            //   {/* Left: Choose section + add item */}
            //   <div className="col left">
            //     <fieldset>
            //       <legend>Select Section</legend>
            //       <select
            //         value={selectedSectionIdx}
            //         onChange={(e) => setSelectedSectionIdx(+e.target.value)}
            //       >
            //         {config!.sections.map((sec, idx) => (
            //           <option key={sec.id} value={idx}>
            //             {sec.name}
            //           </option>
            //         ))}
            //       </select>
            //     </fieldset>

            //     <fieldset>
            //       <legend>
            //         {editingItemIdx !== null ? "Edit Item" : "Add New Item"}
            //       </legend>{" "}
            //       <div className="add-row two-rows">
            //         {/* First row: name + price */}
            //         <div className="row">
            //           <input
            //             type="text"
            //             placeholder="Item name"
            //             value={newItemName}
            //             onChange={(e) => setNewItemName(e.target.value)}
            //           />
            //           <input
            //             type="text"
            //             placeholder="Price"
            //             value={newItemPrice}
            //             onChange={(e) => setNewItemPrice(e.target.value)}
            //           />
            //         </div>
            //         {/* Second row: description + subtext + calories + image */}
            //         <div className="row">
            //           {/* Description */}
            //           {"description" in
            //             (config!.sections[selectedSectionIdx].items[0] ||
            //               {}) && (
            //             <input
            //               type="text"
            //               placeholder="Description"
            //               value={
            //                 editingItemIdx !== null
            //                   ? config!.sections[selectedSectionIdx].items[
            //                       editingItemIdx
            //                     ]?.description || ""
            //                   : ""
            //               }
            //               onChange={(e) => {
            //                 if (editingItemIdx !== null) {
            //                   setConfig((c) => {
            //                     if (!c) return c;
            //                     const secs = [...c.sections];
            //                     const sec = { ...secs[selectedSectionIdx] };
            //                     const items = [...sec.items];
            //                     items[editingItemIdx] = {
            //                       ...items[editingItemIdx],
            //                       description: e.target.value,
            //                     };
            //                     sec.items = items;
            //                     secs[selectedSectionIdx] = sec;
            //                     return { ...c, sections: secs };
            //                   });
            //                 }
            //               }}
            //             />
            //           )}
            //           {/* Subtext */}
            //           {"subtext" in
            //             (config!.sections[selectedSectionIdx].items[0] ||
            //               {}) && (
            //             <input
            //               type="text"
            //               placeholder="Subtext"
            //               value={
            //                 editingItemIdx !== null
            //                   ? config!.sections[selectedSectionIdx].items[
            //                       editingItemIdx
            //                     ]?.subText || ""
            //                   : ""
            //               }
            //               onChange={(e) => {
            //                 if (editingItemIdx !== null) {
            //                   setConfig((c) => {
            //                     if (!c) return c;
            //                     const secs = [...c.sections];
            //                     const sec = { ...secs[selectedSectionIdx] };
            //                     const items = [...sec.items];
            //                     items[editingItemIdx] = {
            //                       ...items[editingItemIdx],
            //                       subText: e.target.value,
            //                     };
            //                     sec.items = items;
            //                     secs[selectedSectionIdx] = sec;
            //                     return { ...c, sections: secs };
            //                   });
            //                 }
            //               }}
            //             />
            //           )}
            //           {/* Calories */}
            //           {"calories" in
            //             (config!.sections[selectedSectionIdx].items[0] ||
            //               {}) && (
            //             <input
            //               type="text"
            //               placeholder="Calories"
            //               value={
            //                 editingItemIdx !== null
            //                   ? config!.sections[selectedSectionIdx].items[
            //                       editingItemIdx
            //                     ]?.calories || ""
            //                   : ""
            //               }
            //               onChange={(e) => {
            //                 if (editingItemIdx !== null) {
            //                   setConfig((c) => {
            //                     if (!c) return c;
            //                     const secs = [...c.sections];
            //                     const sec = { ...secs[selectedSectionIdx] };
            //                     const items = [...sec.items];
            //                     items[editingItemIdx] = {
            //                       ...items[editingItemIdx],
            //                       calories: e.target.value,
            //                     };
            //                     sec.items = items;
            //                     secs[selectedSectionIdx] = sec;
            //                     return { ...c, sections: secs };
            //                   });
            //                 }
            //               }}
            //             />
            //           )}
            //           {/* Image */}
            //           {/* {"image" in
            //             (config!.sections[selectedSectionIdx].items[0] ||
            //               {}) && (
            //             <input
            //               type="text"
            //               placeholder="Image URL"
            //               value={
            //                 editingItemIdx !== null
            //                   ? config!.sections[selectedSectionIdx].items[
            //                       editingItemIdx
            //                     ]?.image || ""
            //                   : ""
            //               }
            //               onChange={(e) => {
            //                 if (editingItemIdx !== null) {
            //                   setConfig((c) => {
            //                     if (!c) return c;
            //                     const secs = [...c.sections];
            //                     const sec = { ...secs[selectedSectionIdx] };
            //                     const items = [...sec.items];
            //                     items[editingItemIdx] = {
            //                       ...items[editingItemIdx],
            //                       image: e.target.value,
            //                     };
            //                     sec.items = items;
            //                     secs[selectedSectionIdx] = sec;
            //                     return { ...c, sections: secs };
            //                   });
            //                 }
            //               }}
            //             />
            //           )} */}
            //           {"image" in
            //           (config!.sections[selectedSectionIdx].items[0] || {}) ? (
            //             <fieldset>
            //               <legend>Item Image</legend>
            //               <div className="image-container">
            //                 {editingItemIdx !== null &&
            //                 config!.sections[selectedSectionIdx].items[
            //                   editingItemIdx
            //                 ]?.image ? (
            //                   <img
            //                     src={
            //                       config!.sections[selectedSectionIdx].items[
            //                         editingItemIdx
            //                       ].image
            //                     }
            //                     alt="Item"
            //                   />
            //                 ) : itemImagePreview ? (
            //                   <img src={itemImagePreview} alt="Preview" />
            //                 ) : null}
            //                 <input
            //                   type="file"
            //                   accept="image/*"
            //                   onChange={handleItemImageUpload}
            //                 />
            //                 <input
            //                   type="text"
            //                   placeholder="No image selected yet."
            //                   value={
            //                     editingItemIdx !== null
            //                       ? config!.sections[selectedSectionIdx].items[
            //                           editingItemIdx
            //                         ]?.image || ""
            //                       : ""
            //                   }
            //                   onChange={(e) => {
            //                     if (editingItemIdx !== null) {
            //                       setConfig((c) => {
            //                         if (!c) return c;
            //                         const secs = [...c.sections];
            //                         const sec = { ...secs[selectedSectionIdx] };
            //                         const items = [...sec.items];
            //                         items[editingItemIdx] = {
            //                           ...items[editingItemIdx],
            //                           image: e.target.value,
            //                         };
            //                         sec.items = items;
            //                         secs[selectedSectionIdx] = sec;
            //                         return { ...c, sections: secs };
            //                       });
            //                     }
            //                   }}
            //                 />
            //               </div>
            //             </fieldset>
            //           ) : (
            //             <fieldset>
            //               <legend>Item Image</legend>
            //               <p>This template doesn't support item images.</p>
            //             </fieldset>
            //           )}
            //           <button
            //             onClick={
            //               editingItemIdx !== null
            //                 ? handleUpdateItem
            //                 : handleAddItem
            //             }
            //           >
            //             {editingItemIdx !== null ? "Update" : "Add"}
            //           </button>
            //         </div>
            //       </div>
            //     </fieldset>
            //   </div>

            //   {/* Right: List of items in that section */}
            //   <div className="col right">
            //     <fieldset>
            //       <legend>
            //         Items in “{config!.sections[selectedSectionIdx].name}”
            //       </legend>
            //       <ul className="item-list">
            //         {config!.sections[selectedSectionIdx].items.map(
            //           (it, idx) => (
            //             <li
            //               key={it.id}
            //               style={{ display: "flex", alignItems: "center" }}
            //             >
            //               {/* Thumbnail */}
            //               <div
            //                 style={{
            //                   width: 20,
            //                   height: 20,
            //                   marginRight: 5,
            //                   borderRadius: 2,
            //                   background: "#eee",
            //                   display: "flex",
            //                   alignItems: "center",
            //                   justifyContent: "center",
            //                   overflow: "hidden",
            //                   border: "1px solid #ccc",
            //                 }}
            //               >
            //                 {it.image ? (
            //                   <img
            //                     src={it.image}
            //                     alt={it.name}
            //                     style={{
            //                       width: "100%",
            //                       height: "100%",
            //                       objectFit: "cover",
            //                     }}
            //                   />
            //                 ) : (
            //                   <div
            //                     style={{
            //                       width: "100%",
            //                       height: "100%",
            //                       background: "#ccc",
            //                     }}
            //                   />
            //                 )}
            //               </div>
            //               <span>
            //                 {it.name} — SAR {it.price}
            //               </span>
            //               <div
            //                 className="actions"
            //                 style={{ marginLeft: "auto" }}
            //               >
            //                 <button
            //                   onClick={() => {
            //                     setEditingItemIdx(idx);
            //                     setNewItemName(it.name);
            //                     setNewItemPrice(it.price);
            //                     setItemImagePreview(it.image || null);
            //                     setActiveTab("items");
            //                   }}
            //                 >
            //                   Edit
            //                 </button>
            //                 <button
            //                   className="delete-btn"
            //                   onClick={() => handleRemoveItem(idx)}
            //                 >
            //                   ×
            //                 </button>
            //               </div>
            //             </li>
            //           )
            //         )}
            //       </ul>
            //     </fieldset>

            //     <div className="actions-bottom">
            //       <button className="btn save" onClick={handleSave}>
            //         Save All Changes
            //       </button>
            //       <button className="btn delete" onClick={handleDeleteAllItems}>
            //         Delete All Items
            //       </button>
            //     </div>
            //   </div>
            // </div>
            <ItemsForm
              sectionId={config.sections[focusedSectionIdx].id}
              sectionIndex={focusedSectionIdx}
              items={config.sections[focusedSectionIdx].items}
              onChange={handleItemsChange}
            />
          )}
        </div>
        <div className="actions-bottom">
          <button className="btn save" onClick={handleSaveAll}>
            Save All Changes
          </button>
          {/* <button className="btn delete" onClick={handleDeleteAllItems}>
                    Delete All Items
                  </button> */}
        </div>
      </div>
    </>
  );
};

export default HeaderImageBuilder;
