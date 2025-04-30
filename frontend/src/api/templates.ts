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
  name: string;
  user_id: string;
  config: TemplateConfig;
  preview_url: string;
  price: string;
  library_id: string;
}

const API = "http://localhost:4000";
const getHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const fetchUserTemplates = (): Promise<Template[]> =>
  fetch(`${API}/templates`, { headers: getHeaders() }).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch templates");
    return res.json();
  });

export function fetchLibraryTemplates() {
  return fetch(`${API}/templates/lib`).then((r) => r.json());
}

export const fetchLibraryTemplate = (id: string): Promise<Template> =>
  fetch(`${API}/templates/lib/${id}`).then((res) => {
    if (!res.ok) throw new Error("Failed to load template");
    return res.json();
  });

  export function getTemplate(id: string): Promise<Template> {
    return fetch(`${API}/templates/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`
      },
    }).then(res => {
      if (!res.ok) throw new Error("Not found");
      return res.json();
    });
  }

export const createTemplate = (config: TemplateConfig): Promise<Template> =>
  fetch(`${API}/templates`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ config }),
  }).then((res) => {
    if (!res.ok) throw new Error("Failed to create template");
    return res.json();
  });

export const updateTemplate = (
  id: string,
  url: TemplateConfig
): Promise<Template> =>
  fetch(`${API}/templates/${id}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ 
      config: { headerImageUrl: url }  // Updates the header image URL only
    })
  }).then((res) => {
    if (!res.ok) throw new Error("Failed to update template");
    return res.json();
  });

export const cloneTemplate = async (id: string): Promise<{ id: string }> => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("You need to be logged in to clone a template.");
  }
  const res = await fetch(`${API}/templates/clone/${id}`, {
    method: "POST",
    headers: getHeaders(),
  });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload.error || "Clone failed");
  return payload;  
};

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
