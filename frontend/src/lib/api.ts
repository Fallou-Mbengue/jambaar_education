import toast from 'react-hot-toast';

const API_BASE = '/api/v1';

interface FetchOptions extends RequestInit {
  params?: Record<string, any>;
}

async function apiFetch<T = any>(path: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...init } = options;

  let url = `${API_BASE}${path}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, String(value));
      }
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const res = await fetch(url, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

  if (res.status === 401) {
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    throw new Error('Non authentifié');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Erreur serveur' }));
    const message = body.message || `Erreur ${res.status}`;
    toast.error(message);
    throw new Error(message);
  }

  if (res.status === 204) return null as T;
  return res.json();
}

export const api = {
  get: <T = any>(path: string, params?: Record<string, any>) =>
    apiFetch<T>(path, { method: 'GET', params }),

  post: <T = any>(path: string, data?: any) =>
    apiFetch<T>(path, { method: 'POST', body: data ? JSON.stringify(data) : undefined }),

  patch: <T = any>(path: string, data?: any) =>
    apiFetch<T>(path, { method: 'PATCH', body: data ? JSON.stringify(data) : undefined }),

  delete: <T = any>(path: string) =>
    apiFetch<T>(path, { method: 'DELETE' }),
};
