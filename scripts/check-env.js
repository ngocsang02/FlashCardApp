#!/usr/bin/env node

/**
 * Script kiểm tra cấu hình môi trường
 * Chạy: node scripts/check-env.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Kiểm tra cấu hình môi trường...\n');

// Kiểm tra file .env
const envPath = path.join(__dirname, '..', '.env');
const envExists = fs.existsSync(envPath);

console.log(`📄 File .env: ${envExists ? '✅ Tồn tại' : '❌ Không tồn tại'}`);

if (!envExists) {
  console.log('💡 Tạo file .env từ env.example:');
  console.log('   cp env.example .env');
  console.log('');
}

// Kiểm tra các biến môi trường cần thiết
const requiredEnvVars = [
  'MONGODB_URI',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

if (envExists) {
  require('dotenv').config();
  
  console.log('🔧 Kiểm tra biến môi trường:');
  
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✅' : '❌';
    const displayValue = value ? (varName.includes('SECRET') || varName.includes('KEY') ? '***' : value) : 'Chưa cấu hình';
    
    console.log(`   ${status} ${varName}: ${displayValue}`);
  });
  
  console.log('');
}

// Kiểm tra cấu hình client
const clientEnvPath = path.join(__dirname, '..', 'client', '.env');
const clientEnvExists = fs.existsSync(clientEnvPath);

console.log(`📄 File client/.env: ${clientEnvExists ? '✅ Tồn tại' : '❌ Không tồn tại'}`);

if (!clientEnvExists) {
  console.log('💡 Tạo file client/.env:');
  console.log('   cd client && echo "REACT_APP_API_URL=http://localhost:5000" > .env');
  console.log('');
}

// Kiểm tra package.json
const packagePath = path.join(__dirname, '..', 'package.json');
const clientPackagePath = path.join(__dirname, '..', 'client', 'package.json');

console.log('📦 Kiểm tra package.json:');

if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  console.log(`   ✅ Server: ${packageJson.name} v${packageJson.version}`);
} else {
  console.log('   ❌ Server: Không tìm thấy package.json');
}

if (fs.existsSync(clientPackagePath)) {
  const clientPackageJson = JSON.parse(fs.readFileSync(clientPackagePath, 'utf8'));
  console.log(`   ✅ Client: ${clientPackageJson.name} v${clientPackageJson.version}`);
} else {
  console.log('   ❌ Client: Không tìm thấy package.json');
}

console.log('');

// Hướng dẫn tiếp theo
console.log('🚀 Hướng dẫn tiếp theo:');
console.log('   1. Cài đặt dependencies: npm run install-all');
console.log('   2. Cấu hình .env file');
console.log('   3. Chạy ứng dụng: npm run dev');
console.log('   4. Xem DEPLOYMENT.md để deploy production');
console.log('');

// Kiểm tra MongoDB connection (nếu có .env)
if (envExists && process.env.MONGODB_URI) {
  console.log('🔗 Kiểm tra kết nối MongoDB...');
  
  const mongoose = require('mongoose');
  
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
  }).then(() => {
    console.log('   ✅ Kết nối MongoDB thành công');
    mongoose.connection.close();
  }).catch((error) => {
    console.log('   ❌ Lỗi kết nối MongoDB:', error.message);
    console.log('   💡 Kiểm tra:');
    console.log('      - MongoDB đang chạy');
    console.log('      - MONGODB_URI đúng format');
    console.log('      - Network connectivity');
  });
} 