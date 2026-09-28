import axios from 'axios';

const getBaseUrl = () => {
  let envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return '/api';
  envUrl = envUrl.trim().replace(/\/+$/, '');
  return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('smart_hostel_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
