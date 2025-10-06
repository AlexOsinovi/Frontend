// file: ../api/client.js

function detectBaseUrl() {
  if (typeof window === 'undefined') return null;
  const runtime = window.localStorage.getItem('API_BASE_URL');
  if (runtime) return runtime;
  if (process.env.REACT_APP_API_BASE_URL) return process.env.REACT_APP_API_BASE_URL;
  const { protocol, hostname } = window.location;
  if (hostname && hostname !== 'localhost') {
    return `${protocol}//${hostname}`;
  }
  return 'http://localhost:8083';
}

const API_BASE_URL = detectBaseUrl();
if (typeof window !== 'undefined') {
  if (!window.__API_BASE_LOGGED__) {
    console.info('[API] Base URL =', API_BASE_URL);
    window.__API_BASE_LOGGED__ = true;
  }
}

let accessToken = localStorage.getItem('accessToken') || null;
let refreshToken = localStorage.getItem('refreshToken') || null;

export function setTokens({ access, refresh }) {
  accessToken = access || null;
  refreshToken = refresh || null;
  if (access) localStorage.setItem('accessToken', access);
  else localStorage.removeItem('accessToken');
  if (refresh) localStorage.setItem('refreshToken', refresh);
  else localStorage.removeItem('refreshToken');
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

async function request(path, { method = 'GET', headers = {}, body } = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  const finalHeaders = { 'Content-Type': 'application/json', ...headers };
  if (accessToken) finalHeaders['Authorization'] = `Bearer ${accessToken}`;

  const res = await fetch(url, { method, headers: finalHeaders, body: body ? JSON.stringify(body) : undefined });

  if (res.status === 401 && refreshToken) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      finalHeaders['Authorization'] = `Bearer ${accessToken}`;
      const retry = await fetch(url, { method, headers: finalHeaders, body: body ? JSON.stringify(body) : undefined });
      return handleResponse(retry);
    }
  }

  return handleResponse(res);
}

async function tryRefresh() {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
      },
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data && data.accessToken && data.refreshToken) {
      setTokens({ access: data.accessToken, refresh: data.refreshToken });
      return true;
    }
    return false;
  } catch (_) {
    return false;
  }
}

async function handleResponse(res) {
  if (res.ok) {
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) return res.json();
    return res.text();
  }
  const text = await res.text();
  const error = new Error(text || `HTTP ${res.status}`);
  error.status = res.status;
  throw error;
}

export async function apiRefreshToken() {
  const refreshed = await tryRefresh();
  if (!refreshed) {
    throw new Error('Failed to refresh token');
  }
  return true;
}
// -------------------------

export function apiLogin(email, password) {
  return request('/auth/login', { method: 'POST', body: { email, password } }).then((data) => {
    if (data?.accessToken && data?.refreshToken) setTokens({ access: data.accessToken, refresh: data.refreshToken });
    return data;
  });
}

export function apiRegister(payload) {
  return request('/auth/register', { method: 'POST', body: payload });
}

export function apiValidateToken() {
  return request('/auth/validate-token', { method: 'GET' });
}

export function apiGetUserByEmail(email) {
  return request(`/api/users/email/${encodeURIComponent(email)}`, { method: 'GET' });
}

export function apiUpdateUser(id, user) {
  return request(`/api/users/${encodeURIComponent(id)}`, { method: 'PUT', body: user });
}

export function apiGetItems() {
  return request('/api/items', { method: 'GET' });
}

export function apiCreateOrder(order) {
  return request('/api/orders', { method: 'POST', body: order });
}

export function apiGetOrders() {
  return request('/api/orders', { method: 'GET' });
}

export function apiGetCardsByUser(userId) {
  return request(`/api/cards/user/${encodeURIComponent(userId)}`, { method: 'GET' });
}

export function apiCreateCard(userId, card) {
  return request(`/api/cards/user/${encodeURIComponent(userId)}`, { method: 'POST', body: card });
}

export function apiDeleteCard(cardId) {
  return request(`/api/cards/${encodeURIComponent(cardId)}`, { method: 'DELETE' });
}

export default request;