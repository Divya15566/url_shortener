import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://url-shortener-dx3x.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor if needed
api.interceptors.request.use((config) => {
  // You can modify requests here (e.g., add auth token)
  return config;
});

export default api;