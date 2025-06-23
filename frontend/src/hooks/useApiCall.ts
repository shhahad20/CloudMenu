import { API_URL } from "../api/api";
import { getValidAccessToken } from "../utils/authUtils";

export async function apiFetch(
  path: string,
  opts: RequestInit = {}
): Promise<Response> {
  const token = await getValidAccessToken();
  const headers = new Headers(opts.headers);
  headers.set("Authorization", `Bearer ${token}`);
  const url = `${API_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  // …rest of token logic…
  const res = await fetch(url, { ...opts, headers });
  return res;
}
