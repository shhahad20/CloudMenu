// src/pages/TemplateRenderer.tsx
import React, { useEffect, useState, Suspense } from "react";
import { useParams } from "react-router-dom";
// import LoadingSpinner from "../components/LoadingSpinner";

// import all your specific renderers…
import Template1 from "../components/Templates/Classic.tsx";
import Template2 from "../components/Templates/Template2.tsx";
// import Template3Renderer from "../components/menus/Template3Renderer";
import { fetchAnyTemplate, Template } from "../api/templates";
import LoadingSpinner from "../components/UI/LoadingSpinner.tsx";
import GildedPlateMenu from "../components/Templates/TheGildedPlate.tsx";
import MoriningRituals from "../components/Templates/MoriningRituals.tsx";

// map template “type” (or name) → component
const renderers: Record<string, React.FC<{ template: Template }>> = {
  template1: Template1,
  template2: Template2,
  template3: GildedPlateMenu,
  template4: MoriningRituals,
  // …add more as you add more originals…
};

const TemplateRenderer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [template, setTemplate] = useState<Template | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchAnyTemplate(id)
      .then(setTemplate)
      .catch(() => setError("Template not found in library or user menus."));
  }, [id]);
 
    useEffect(() => {
  if (template) {
    console.log("🔍 fetched template:", template);
  }
}, [template]);

  if (error) return <p>{error}</p>;
  if (!template) return <LoadingSpinner />;

  // pick the right renderer based on `template.config.type`
  const type = template.config?.type;
  const Renderer =
    (type && renderers[type]) ||
    (() => <p>Sorry, no renderer found for “{type ?? "unknown"}”.</p>);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Renderer template={template} />
    </Suspense>
  );
};

export default TemplateRenderer;
