// Cấu hình môi trường cho server
require('dotenv').config();

const config = {
  // Cấu hình server
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Cấu hình MongoDB
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/flashcard-app',
  
  // Cấu hình Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'dgln3kmbt',
    apiKey: process.env.CLOUDINARY_API_KEY || '123256545382126',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '3dRan57a2FrSUIcnoiBxkGQso5I'
  },
  
  // Cấu hình CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  },
  
  // Cấu hình upload
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedCsvTypes: ['text/csv', 'application/csv']
  },
  
  // Cấu hình rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  }
};

// Helper functions
const isDevelopment = () => config.nodeEnv === 'development';
const isProduction = () => config.nodeEnv === 'production';
const isLocalhost = () => config.mongoUri.includes('localhost') || config.mongoUri.includes('127.0.0.1');

// Debug logging chỉ trong development
const debugLog = (...args) => {
  if (isDevelopment()) {
    console.log('[DEBUG]', ...args);
  }
};

// Error logging
const errorLog = (...args) => {
  console.error('[ERROR]', ...args);
};

// Info logging
const infoLog = (...args) => {
  console.log('[INFO]', ...args);
};

module.exports = {
  config,
  isDevelopment,
  isProduction,
  isLocalhost,
  debugLog,
  errorLog,
  infoLog
}; 