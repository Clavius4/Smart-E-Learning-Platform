import axios from 'axios';
import { clearStoredAdminToken, getStoredAdminToken } from 'utils/authStorage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || 'http://206.189.112.134:5000/api',
});

// ✅ add token for *all* verbs (GET, POST, DELETE, …)
api.interceptors.request.use((config) => {
  const token = getStoredAdminToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      clearStoredAdminToken();

      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.startsWith('/admin/auth/signin')
      ) {
        window.location.assign('/admin/auth/signin');
      }
    }

    return Promise.reject(error);
  },
);

export default api;
