import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const rawBaseUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.API_BASE_URL || import.meta.env.VITE_API_BASE_URL;
const normalizedBaseUrl = (() => {
  if (!rawBaseUrl) {
    return 'http://206.189.112.134:5000/api';
  }
  if (rawBaseUrl.includes('localhost') || rawBaseUrl.includes('127.0.0.1')) {
    return 'http://206.189.112.134:5000/api';
  }
  const trimmed = rawBaseUrl.replace(/\/$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
})();

const api = axios.create({
  baseURL: normalizedBaseUrl,

  withCredentials: true, // Keep this consistent
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(config => {
  console.log(`Requesting ${config.method?.toUpperCase()} ${config.url}`);

  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, error => {
  console.error('Request error:', error);
  return Promise.reject(error);
});

// Response interceptor
// In your axios.js
api.interceptors.response.use(response => {
  // Ensure consistent response structure
  if (response.data && typeof response.data === 'object') {
    return {
      ...response,
      data: {
        success: response.data.success !== false, // Default to true unless explicitly false
        ...response.data
      }
    };
  }
  return response;
}, error => {
  // Handle errors consistently
  if (error.response) {
    error.response.data = {
      success: false,
      message: error.response.data?.message || 'Request failed',
      ...error.response.data
    };
  }
  return Promise.reject(error);
});

export default api
