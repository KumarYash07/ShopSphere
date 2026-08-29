import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to attach JWT token (except for unauthenticated auth endpoints)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ss_token');
    const requestUrl = config.url || '';
    const isAuthEndpoint = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

    if (token && !isAuthEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    const isAuthEndpoint = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');
    const message = error.response?.data?.message || 'An unexpected error occurred.';

    if (status === 401 && !isAuthEndpoint) {
      // Token expired or invalid for authenticated API requests
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/verify-email') {
        localStorage.removeItem('ss_token');
        localStorage.removeItem('ss_user');
        window.dispatchEvent(new CustomEvent('auth:unauthorized', { detail: message }));
      }
    } else if (status === 403) {
      console.warn('Forbidden access:', message);
    }

    return Promise.reject(error);
  }
);

export default api;
