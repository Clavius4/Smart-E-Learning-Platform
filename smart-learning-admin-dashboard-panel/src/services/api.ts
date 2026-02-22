import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://206.189.112.134:5000/api',
});

// ✅ add token for *all* verbs (GET, POST, DELETE, …)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');        // or cookies
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

