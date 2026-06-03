import axios from 'axios'
import { resolveApiBaseUrl } from '@/utils/apiBaseUrl'

const api = axios.create({
  baseURL: resolveApiBaseUrl(),

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
