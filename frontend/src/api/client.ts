const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-logout'));
    }
    throw new Error(data.error || 'API Error');
  }

  return data;
};
