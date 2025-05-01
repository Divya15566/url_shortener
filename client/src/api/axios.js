import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
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