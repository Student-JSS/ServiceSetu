import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Intercept requests to attach JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('coop_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept responses for auth expiration
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Optional auto-logout on token expiration
      // localStorage.removeItem('coop_token');
    }
    return Promise.reject(error);
  }
);

export default API;
