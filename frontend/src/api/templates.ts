export interface Section {
  id: string;
  name: string;
  color?: string;
  image?: string; // optional image URL for the section
  items: Array<{
    id: string;
    name: string;
    price: number;
    image?: string;
    subText?: string;
    description?: string;
    calories?: string;
  }>;
}
export type TextBlock = {
  id: string;
  label: string; // human-friendly name
  value: string;
};
export interface TemplateConfig {
  id?: string;
  logo: string;
  type?: string;
  slogan?: string;
  header_image: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
  };
  sections: Section[];
  text: TextBlock[];
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
  view_count: number;
  updated_at: string;
  created_at: string;
}

export interface ClonedTemplate extends Template {
  qr: string;   // new
}
export interface InvoiceType {
  id: string;
  status: string;
  invoice_date: string;
  subtotal: number;
  tax: number;
  total: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

const API = "http://localhost:4000";

const getHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// export const fetchUserTemplates = (): Promise<Template[]> =>
//   fetch(`${API}/templates`, { headers: getHeaders() }).then((res) => {
//     if (!res.ok) throw new Error("Failed to fetch templates");
//     return res.json();
//   });

// export function fetchLibraryTemplates() {
//   return fetch(`${API}/templates/lib`).then((r) => r.json());
// }

export async function fetchUserTemplates(
  opts: {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    order?: "asc" | "desc";
    q?: string;
  } = {}
): Promise<PaginatedResult<Template>> {
  const {
    page = 1,
    pageSize = 10,
    sortBy = "updated_at",
    order = "desc",
    q = "",
  } = opts;
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    sortBy,
    order,
  });
  if (q) params.append("q", q);

  const token = localStorage.getItem("access_token");
  const res = await fetch(`${API}/templates?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch your menus");
  return res.json();
}

export async function fetchLibraryTemplates(
  opts: {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    order?: "asc" | "desc";
    q?: string;
  } = {}
): Promise<PaginatedResult<Template>> {
  const {
    page = 1,
    pageSize = 10,
    sortBy = "view_count",
    order = "desc",
    q = "",
  } = opts;
  const params = new URLSearchParams();
  params.append("page", String(page));
  params.append("pageSize", String(pageSize));
  params.append("sortBy", sortBy);
  params.append("order", order);
  if (q) params.append("q", q);

  const res = await fetch(`${API}/templates/lib?${params.toString()}`, {
    headers: {
      "Content-Type": "application/json",
      // assume you add auth here if needed
    },
  });
  if (!res.ok) throw new Error("Failed to fetch templates");
  return res.json();
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
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  }).then((res) => {
    if (!res.ok) throw new Error("Not found");
    return res.json();
  });
}
export function fetchAnyTemplate(id: string): Promise<Template> {
  return fetchLibraryTemplate(id).catch(() => getTemplate(id));
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
      config: { headerImageUrl: url }, // Updates the header image URL only
    }),
  }).then((res) => {
    if (!res.ok) throw new Error("Failed to update template");
    return res.json();
  });

// export const cloneTemplate = async (id: string): Promise<ClonedTemplate> => {
//   const token = localStorage.getItem("access_token");
//   if (!token) {
//     throw new Error("You need to be logged in to clone a template.");
//   }
//   const res = await fetch(`${API}/templates/clone/${id}`, {
//     method: "POST",
//     headers: getHeaders(),
//   });
// const body = await res.json().catch(() => null);
//   if (!res.ok || !body || !body.id) {
//     throw new Error(
//       body?.error
//         ? `Clone failed: ${body.error}`
//         : `Clone failed: HTTP ${res.status}`
//     );
//   }
//   return body as ClonedTemplate;
// };

export const cloneTemplate = async (id: string): Promise<ClonedTemplate> => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("You need to be logged in to clone a template.");
  }

  const res = await fetch(`${API}/templates/clone/${id}`, {
    method: "POST",
    headers: getHeaders(),
  });

  // 1) Read raw text
  const text = await res.text();

  // 2) Try to parse JSON, but keep it as unknown
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    body = null;
  }

  // 3) Log for debugging
  console.groupCollapsed(`cloneTemplate [${res.status}]`);
  console.log("RAW response text:", text);
  console.log("PARSED JSON body:", body);
  console.groupEnd();

  // 4) Narrow: make sure we got an object with an 'id' string
  if (
    !res.ok ||
    typeof body !== "object" ||
    body === null ||
    !("id" in body) ||
    typeof (body as { id: string }).id !== "string"
  ) {
    // Try to extract an error message
    const errMsg =
      typeof body === "object" && body !== null && "error" in body
        ? String((body as Record<string, unknown>).error)
        : `HTTP ${res.status}`;
    throw new Error(`Clone failed: ${errMsg}`);
  }

  // 5) Safe to cast now
  return body as ClonedTemplate;
};



export const plans = () =>
  fetch(`${API}/plans`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  }).then((res) => {
    if (!res.ok) throw new Error("Not found");
    return res.json();
  });

// export const userInvoices = () =>
//   fetch(`${API}/invoices`, {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${localStorage.getItem("access_token")}`,
//     },
//   }).then((res) => {
//     if (!res.ok) throw new Error("Invoices not found");
//     return res.json();
//   });

export async function fetchUserInvoices(
  opts: {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    order?: "asc" | "desc";
    q?: string;
    status?: string;
  } = {}
): Promise<PaginatedResult<InvoiceType>> {
  const {
    page = 1,
    pageSize = 10,
    sortBy = "invoice_date",
    order = "desc",
    q = "",
    status = "",
  } = opts;
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    sortBy,
    order,
  });
    if (q) params.append("q", q);
  if (status) params.append("status", status);
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${API}/invoices?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch invoices");
  return res.json();
}

export const fetchTemplateQR = (id: string) =>
  fetch(`${API}/templates/${id}/qrcode`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  }).then((res) => {
    if (!res.ok) throw new Error("QR code not found");
    return res.json();
  });