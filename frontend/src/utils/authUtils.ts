import { API_URL } from "../api/api";

export interface TokenData {
  access_token: string; refresh_token: string;
  expires_at: number;    token_type: string;
}
export interface User { id: string; email: string; role: string; }

export function setTokens(t: TokenData) {
  localStorage.setItem('access_token',  t.access_token);
  localStorage.setItem('refresh_token', t.refresh_token);
  localStorage.setItem('expires_at',    t.expires_at.toString());
  localStorage.setItem('token_type',    t.token_type);
}
export function getTokens(): TokenData | null {
  const a = localStorage.getItem('access_token'),
        r = localStorage.getItem('refresh_token'),
        e = localStorage.getItem('expires_at'),
        t = localStorage.getItem('token_type');
  if (!a||!r||!e) return null;
  return { access_token:a, refresh_token:r, expires_at:+e, token_type:t||'Bearer' };
}
export function clearTokens() {
  ['access_token','refresh_token','expires_at','token_type','user']
    .forEach(k=>localStorage.removeItem(k));
}
export function setUser(u: User) {
  localStorage.setItem('user', JSON.stringify(u));
}
export function getUser(): User | null {
  const u = localStorage.getItem('user');
  return u? JSON.parse(u): null;
}

// check expiry & auto‑refresh
const bufferMs = 5*60*1000;
function isExpired(expiresAt: number) {
  return Date.now() >= (expiresAt*1000 - bufferMs);
}

export async function getValidToken(): Promise<string|null> {
  const tokens = getTokens();
  if (!tokens) return null;
  if (!isExpired(tokens.expires_at)) return tokens.access_token;

  
  // refresh
  const resp = await fetch(`${API_URL}/auth/refresh-token`, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ refresh_token: tokens.refresh_token })
  });
  if (!resp.ok) {
    clearTokens();
    return null;
  }
  const data = await resp.json();
  const newT = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at:    data.expires_at,
    token_type:    data.token_type,
  };
  setTokens(newT);
  return newT.access_token;
}

export interface SignInResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

// signin & signout
export async function signIn(email: string, password: string): Promise<SignInResponse> {
  const res = await fetch(`${API_URL}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload.error || 'Signin failed');
  }

  // Persist all three tokens
  localStorage.setItem('access_token', payload.access_token);
  localStorage.setItem('refresh_token', payload.refresh_token);
  localStorage.setItem('expires_at', payload.expires_at.toString());

  return payload;
}

export async function signout() {
  const token = await getValidToken();
  await fetch(`${API_URL}/auth/logout`, {
    method:'POST',
    headers:{ 'Authorization': `Bearer ${token}` }
  });
  clearTokens();
}


interface SessionTokens {
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

async function refreshTokens(oldRefreshToken: string): Promise<SessionTokens> {
  const res = await fetch(`${API_URL}/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: oldRefreshToken })
  });
if (!res.ok) throw new Error('Unable to refresh session');
  const session = await res.json() as SessionTokens;

  // write **all** three back into localStorage
  localStorage.setItem('access_token', session.access_token);
  localStorage.setItem('refresh_token', session.refresh_token);
  localStorage.setItem('expires_at', session.expires_at.toString());

  return session;
}

export async function getValidAccessToken(): Promise<string> {
  let access_token = localStorage.getItem('access_token');
  const refresh_token = localStorage.getItem('refresh_token');
  const expires_at = Number(localStorage.getItem('expires_at') || '0');
  const now = Math.floor(Date.now() / 1000);

  if (!access_token || !refresh_token) {
    throw new Error('Not authenticated');
  }

  if (now >= expires_at) {
    // session expired → rotate
    const session = await refreshTokens(refresh_token);
    access_token = session.access_token;
    localStorage.setItem('access_token', session.access_token);
    localStorage.setItem('refresh_token', session.refresh_token);
    localStorage.setItem('expires_at', session.expires_at);
  }

  return access_token;
}