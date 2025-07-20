// Cấu hình môi trường cho ứng dụng
const config = {
  // API URL - tự động detect môi trường
  apiUrl: process.env.REACT_APP_API_URL || 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? 'http://localhost:5000' 
      : window.location.origin),
  
  // Môi trường hiện tại
  environment: process.env.NODE_ENV || 'development',
  
  // Cấu hình Cloudinary (nếu cần)
  cloudinary: {
    cloudName: 'dgln3kmbt',
    uploadPreset: 'ml_default'
  },
  
  // Cấu hình localStorage keys
  storageKeys: {
    vocabularies: 'vocabularies',
    userSettings: 'userSettings',
    quizProgress: 'quizProgress'
  },
  
  // Cấu hình pagination
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100
  },
  
  // Cấu hình timeout cho API calls
  timeouts: {
    apiCall: 10000, // 10 seconds
    imageLoad: 5000  // 5 seconds
  }
};

// Helper functions
export const isDevelopment = () => config.environment === 'development';
export const isProduction = () => config.environment === 'production';
export const isLocalhost = () => window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Debug logging chỉ trong development
export const debugLog = (...args) => {
  if (isDevelopment()) {
    console.log('[DEBUG]', ...args);
  }
};

// Error logging
export const errorLog = (...args) => {
  console.error('[ERROR]', ...args);
};

export default config; 