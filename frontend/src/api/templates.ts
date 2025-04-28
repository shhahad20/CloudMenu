// src/api/templates.ts
export interface Section {
    id: string;
    name: string;
    color?: string;
    items: Array<{
      id: string;
      name: string;
      price: string;
      imageUrl?: string;
    }>;
  }
  
  export interface TemplateConfig {
    id?: string;
    logo: string;
    header_image: string;
    colors: {
      primary: string;
      secondary: string;
      background: string;
      text: string;
    };
    sections: Section[];
    updated_at?: string;
    created_at?: string;
  }
  
  export interface Template {
    id: string;
    user_id: string;
    config: TemplateConfig;
    preview_url: string;
    price: string;
  }
  
  const API = 'http://localhost:4000';
  const getHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };
  
  export const fetchTemplates = (): Promise<Template[]> =>
    fetch(`${API}/templates`, { headers: getHeaders() })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch templates');
        return res.json();
      });
  
  export const getTemplate = (id: string): Promise<Template> =>
    fetch(`${API}/templates/${id}`, { headers: getHeaders() })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load template');
        return res.json();
      });
  
  export const createTemplate = (config: TemplateConfig): Promise<Template> =>
    fetch(`${API}/templates`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ config }),
    }).then(res => {
      if (!res.ok) throw new Error('Failed to create template');
      return res.json();
    });
  
  export const updateTemplate = (id: string, config: TemplateConfig): Promise<Template> =>
    fetch(`${API}/templates/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ config }),
    }).then(res => {
      if (!res.ok) throw new Error('Failed to update template');
      return res.json();
    });
  
  // A reasonable default config for “new” templates:
  // export const defaultConfig: TemplateConfig = {
  //   layoutVariant: 'classic',
  //   logoUrl: '',
  //   baseColors: {
  //     primary: '#6d5bba',
  //     secondary: '#f0f0f0',
  //     background: '#ffffff',
  //     text: '#333333',
  //   },
  //   sections: [],
  // };
  