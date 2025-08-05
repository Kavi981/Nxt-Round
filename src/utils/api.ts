import axios from 'axios';

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
  retry: 3, // Retry failed requests
  retryDelay: 1000, // Wait 1 second between retries
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add timestamp to prevent caching issues
    if (config.method === 'get') {
      config.params = { ...config.params, _t: Date.now() };
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors and network issues
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API Error:', error);
    
    // Handle network errors
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      console.error('Network error detected. Please check your connection.');
      // You could show a user-friendly notification here
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout. Server might be down.');
    }
    
    // Handle auth errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;