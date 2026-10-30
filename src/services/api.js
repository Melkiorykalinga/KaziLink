import axios from 'axios';

const isLocal =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Automatically use local Express API on localhost, and /api (or VITE_API_URL) on live web deployment
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:5000/api' : '/api'),
});

// Interceptor to inject JWT Token natively into all outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
