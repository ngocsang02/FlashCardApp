const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!', timestamp: new Date().toISOString() });
});

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/flashcard-app';
const isLocal = mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1');

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', (error) => {
  console.error('❌ MongoDB connection error:', error);
  if (isLocal) {
    console.log('💡 Local MongoDB không kết nối được. Hãy đảm bảo:');
    console.log('   1. MongoDB đã được cài đặt');
    console.log('   2. MongoDB service đang chạy: net start MongoDB');
    console.log('   3. Hoặc chạy thủ công: mongod');
  } else {
    console.log('💡 Atlas MongoDB không kết nối được. Hãy kiểm tra:');
    console.log('   1. Connection string trong .env');
    console.log('   2. Network access trong Atlas');
    console.log('   3. Username/password');
  }
});
db.once('open', () => {
  console.log(`✅ Connected to MongoDB: ${isLocal ? 'LOCAL' : 'ATLAS'}`);
  console.log(`📊 Database: ${mongoUri.split('/').pop().split('?')[0]}`);
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}`);
  console.log(`🔗 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`📊 MongoDB URI: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/flashcard-app'}`);
}); 