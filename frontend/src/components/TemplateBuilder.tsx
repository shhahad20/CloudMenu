// src/components/HeaderImageBuilder.tsx

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTemplate } from "../api/templates";
import {API_URL} from "../api/api";
const HeaderImageBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [currentUrl, setCurrentUrl] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTemplate(id!).then(
      tpl => setCurrentUrl(tpl.config.header_image)
    ).catch(() => setError("Failed to load template."))
     .finally(() => setLoading(false));
  }, [id]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
  
    const form = new FormData();
    form.append("image_url", file);     // must match uploadMiddleware key
  
    try {
      const res = await fetch(
        `${API_URL}/templates/${id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`
            // note: NO Content-Type header here
          },
          body: form
        }
      );
      if (!res.ok) throw res;
      const { config } = await res.json();
      setCurrentUrl(config.header_image);
    } catch {
      setError("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };
  

  if (loading) return <p>Loading…</p>;

  return (
    <div style={{ padding: 20, maxWidth: 400 }}>
      <h2>Header Image</h2>

      {currentUrl ? (
        <img
          src={currentUrl}
          alt="Header"
          style={{ width: "100%", marginBottom: 16 }}
        />
      ) : (
        <p>No header image set.</p>
      )}

      <input
        type="file"
        accept="image/*"
        disabled={uploading}
        onChange={handleFile}
      />

      {uploading && <p>Uploading…</p>}
      {error     && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default HeaderImageBuilder;
