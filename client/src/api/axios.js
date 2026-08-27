import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ss_token');
    if (token) {
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
    const message = error.response?.data?.message || 'An unexpected error occurred.';

    if (status === 401) {
      // Token expired or invalid
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/verify-email') {
        localStorage.removeItem('ss_token');
        localStorage.removeItem('ss_user');
        // Dispatch custom event or handle token expiry gracefully
        window.dispatchEvent(new CustomEvent('auth:unauthorized', { detail: message }));
      }
    } else if (status === 403) {
      console.warn('Forbidden access:', message);
    }

    return Promise.reject(error);
  }
);

export default api;
