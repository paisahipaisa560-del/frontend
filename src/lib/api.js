import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';
if (!baseURL.startsWith('http://') && !baseURL.startsWith('https://') && !baseURL.startsWith('/')) {
  console.warn(`[API] VITE_API_URL "${baseURL}" is not a valid URL or path. Falling back to "/api".`);
}
const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const adminToken = localStorage.getItem('adminToken');
  const url = config.url || '';
  const isAdminPath = url.includes('/admin/') || url.includes('/all') || url.includes('/approve') || url.includes('/reject');
  if (isAdminPath && adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config.url || '';
      const isAdminRoute = url.includes('/admin/') || url.includes('/all') || url.includes('/approve') || url.includes('/reject');
      if (isAdminRoute) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
        window.location.href = '/admin/login';
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
