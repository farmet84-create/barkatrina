const BASE = '/api';

async function request(method: string, path: string, body?: any) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Request failed: ${method} ${path}`);
  }
  return res.json();
}

export const api = {
  get: (path: string) => request('GET', path),
  post: (path: string, body?: any) => request('POST', path, body ?? {}),
  put: (path: string, body?: any) => request('PUT', path, body ?? {}),
  patch: (path: string, body?: any) => request('PATCH', path, body ?? {}),
  del: (path: string) => request('DELETE', path)
};
