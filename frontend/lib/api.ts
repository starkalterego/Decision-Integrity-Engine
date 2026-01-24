/**
 * Utility functions for making authenticated API requests
 */

/**
 * Makes an authenticated fetch request with the JWT token from localStorage
 * Automatically handles 401/403 responses by redirecting to login
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('authToken');
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle authentication errors
  if (response.status === 401 || response.status === 403) {
    // Clear token and redirect to login
    localStorage.removeItem('authToken');
    
    // Only redirect if not already on login page
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }

  return response;
}

/**
 * Makes an authenticated GET request
 */
export async function authGet(url: string, options: RequestInit = {}): Promise<Response> {
  return authFetch(url, {
    ...options,
    method: 'GET',
  });
}

/**
 * Makes an authenticated POST request with JSON body
 */
export async function authPost(url: string, data: unknown, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  
  return authFetch(url, {
    ...options,
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
}

/**
 * Makes an authenticated PUT request with JSON body
 */
export async function authPut(url: string, data: unknown, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  
  return authFetch(url, {
    ...options,
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });
}

/**
 * Makes an authenticated DELETE request
 */
export async function authDelete(url: string, options: RequestInit = {}): Promise<Response> {
  return authFetch(url, {
    ...options,
    method: 'DELETE',
  });
}

/**
 * Makes an authenticated PATCH request with JSON body
 */
export async function authPatch(url: string, data: unknown, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  
  return authFetch(url, {
    ...options,
    method: 'PATCH',
    headers,
    body: JSON.stringify(data),
  });
}
