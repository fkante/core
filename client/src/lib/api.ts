import { env } from '@/env';
import { getAuthToken } from '@/services/authService';

const API_URL = env.VITE_SERVER_URL;

interface ApiOptions {
  method: string;
  headers?: Record<string, string>;
  body?: string;
}


async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.message || 'An error occurred');
    }

    return json;
  }

  if (!response.ok) {
    throw new Error('An error occurred');
  }

  return {} as T;
}

async function request<T>(
  endpoint: string,
  options: ApiOptions = { method: 'GET' }
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method: options.method,
    headers,
    body: options.body,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    return handleResponse<T>(response);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error');
  }
}

export const api = {
  get: <T>(endpoint: string, headers?: Record<string, string>): Promise<T> =>
    request<T>(endpoint, { method: 'GET', headers }),

  post: <T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<T> =>
    request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    }),

  put: <T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<T> =>
    request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    }),

  delete: <T>(endpoint: string, headers?: Record<string, string>): Promise<T> =>
    request<T>(endpoint, { method: 'DELETE', headers }),
};
