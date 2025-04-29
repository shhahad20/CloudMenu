// src/pages/TemplatePage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getTemplate, Template } from '../api/templates'; 
// import '../styles/templatePage.scss';

const TemplatePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<Template|null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string|null>(null);

  useEffect(() => {
    if (!id) return navigate('/menus');
    getTemplate(id)
      .then((t: Template) => setTemplate(t))
      .catch((err: unknown) => {
        console.error(err);
        setError('Could not load template.');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <p className="center">Loading…</p>;
  if (error)   return <p className="center error">{error}</p>;
  if (!template) return null;

  // Example render: you can replace this with your full JSX/TemplateRenderer
  return (
<>
      <Navbar />
      <div className="template-page">
        <h1>{template.name}</h1>
        <img src={template.preview_url} alt={template.name} className="preview-img"/>
        {/* If your Template type has a `config` JSON, you can JSON.stringify it: */}
        <pre className="json-block">
          {JSON.stringify(template.config, null, 2)}
        </pre>
      </div>
      <Footer />
    </>
  );
};

export default TemplatePage;
