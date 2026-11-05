import axios from 'axios';

//Base Axios instance for all backend API communication that connects to express server running on Port 5001.
const axiosClient = axios.create({
  baseURL: (import.meta as ImportMeta & { env: { VITE_API_BASE_URL?: string } }).env.VITE_API_BASE_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

//This is the Request Interceptor. It automatically attaches the JWT authorization token from localStorage to every outgoing backend request.
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosClient;