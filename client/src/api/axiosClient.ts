import axios from 'axios';

const viteEnvironment = (import.meta as ImportMeta & {
  env: { VITE_API_BASE_URL?: string; DEV: boolean };
}).env;

const configuredApiBaseUrl = viteEnvironment.VITE_API_BASE_URL;
const defaultApiBaseUrl = viteEnvironment.DEV ? 'http://localhost:5001/api' : '/api';
const configuredBase = (configuredApiBaseUrl?.trim() || defaultApiBaseUrl).replace(/\/+$/, '');

export const API_BASE_URL = /\/api$/i.test(configuredBase)
  ? configuredBase
  : `${configuredBase}/api`;

//Base Axios instance for all backend API communication that connects to express server running on Port 5001.
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
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