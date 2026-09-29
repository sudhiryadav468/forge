export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); this.name = 'ApiError'; }
}
let csrfRequest: Promise<string> | null = null;
let refreshRequest: Promise<boolean> | null = null;

async function csrf(): Promise<string> {
  if (!csrfRequest) csrfRequest = fetch('/api/auth/csrf', { credentials: 'include', cache: 'no-store' })
    .then(async (res) => { if (!res.ok) throw new ApiError('Could not start a secure session', res.status);
      return (await res.json() as { csrfToken: string }).csrfToken; })
    .catch(error => { csrfRequest = null; throw error; });
  return csrfRequest;
}

export async function api<T>(path: string, options: { method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown } = {}, retry = true, csrfRetry = true): Promise<T> {
  const method = options.method || 'GET';
  const headers: Record<string, string> = {};
  if (method !== 'GET') headers['x-csrf-token'] = await csrf();
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  let response: Response;
  try {
    response = await fetch(`/api${path}`, { method, headers, credentials: 'include',
      cache: 'no-store', body: options.body === undefined ? undefined : JSON.stringify(options.body) });
  } catch { throw new ApiError('Cannot reach the server. Please check your connection.', 0); }
  if (response.status === 401 && retry && !path.startsWith('/auth/refresh') &&
      !['/auth/login', '/auth/register', '/auth/demo'].includes(path)) {
    if (!refreshRequest) refreshRequest = api('/auth/refresh', { method: 'POST' }, false)
      .then(() => true).catch(() => false).finally(() => { refreshRequest = null; });
    if (await refreshRequest) return api<T>(path, options, false);
  }
  const data = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) {
    const message = Array.isArray(data.message) ? data.message.join(' · ') :
      typeof data.message === 'string' ? data.message : `Request failed (${response.status})`;
    // Another tab may have rotated the host-only CSRF cookie. Re-bootstrap once.
    if (response.status === 403 && csrfRetry && message.includes('CSRF token')) {
      csrfRequest = null;
      return api<T>(path, options, retry, false);
    }
    throw new ApiError(message, response.status);
  }
  return data as T;
}
export function errorMessage(error: unknown) { return error instanceof Error ? error.message : 'Something went wrong. Try again.'; }
