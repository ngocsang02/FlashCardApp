import axios from 'axios';
import config, { debugLog, errorLog } from './config/environment';

// Cấu hình axios với base URL tự động detect
axios.defaults.baseURL = config.apiUrl;

// Cấu hình timeout
axios.defaults.timeout = config.timeouts.apiCall;

// Request interceptor để log trong development
axios.interceptors.request.use(
  (config) => {
    debugLog('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    errorLog('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor để log trong development
axios.interceptors.response.use(
  (response) => {
    debugLog('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    errorLog('Response Error:', error.response?.status, error.response?.data, error.config?.url);
    return Promise.reject(error);
  }
);

export default axios; 