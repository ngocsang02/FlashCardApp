# 🚀 Hướng dẫn Deployment Flashcard App

## 📋 Yêu cầu hệ thống

- Node.js 16+
- MongoDB (local hoặc Atlas)
- Cloudinary account (cho upload ảnh)

## 🏠 Local Development

### 1. Cài đặt dependencies

```bash
# Cài đặt dependencies cho cả server và client
npm run install-all
```

### 2. Cấu hình môi trường

Tạo file `.env` trong thư mục gốc:

```bash
cp env.example .env
```

Chỉnh sửa file `.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration (local)
MONGODB_URI=mongodb://localhost:27017/flashcard-app

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS Configuration
CORS_ORIGIN=*

# Client Configuration
REACT_APP_API_URL=http://localhost:5000
```

### 3. Chạy ứng dụng

```bash
# Chạy cả server và client
npm run dev

# Hoặc chạy riêng lẻ
npm run server    # Server ở port 5000
npm run client    # Client ở port 3000
```

## 🌐 Production Deployment

### Backend (Render)

1. **Tạo tài khoản Render** và tạo Web Service mới

2. **Cấu hình Build Command:**

```bash
npm install
```

3. **Cấu hình Start Command:**

```bash
npm run server
```

4. **Environment Variables:**

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/flashcard-app?retryWrites=true&w=majority
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### Frontend (Vercel)

1. **Tạo tài khoản Vercel** và import project

2. **Cấu hình Build Command:**

```bash
cd client && npm install && npm run build
```

3. **Cấu hình Output Directory:**

```
client/build
```

4. **Environment Variables:**

```env
REACT_APP_API_URL=https://your-backend-render-url.onrender.com
```

### MongoDB Atlas

1. **Tạo cluster** trên MongoDB Atlas
2. **Tạo database user** với quyền read/write
3. **Whitelist IP** (0.0.0.0/0 cho production)
4. **Lấy connection string** và cập nhật `MONGODB_URI`

### Cloudinary

1. **Tạo tài khoản** trên Cloudinary
2. **Lấy credentials** từ Dashboard
3. **Cập nhật environment variables**

## 🔧 Cấu hình nâng cao

### CORS Configuration

```env
# Cho phép tất cả origins (development)
CORS_ORIGIN=*

# Chỉ cho phép frontend domain (production)
CORS_ORIGIN=https://your-app.vercel.app
```

### Rate Limiting

Cấu hình trong `server/config/environment.js`:

```javascript
rateLimit: {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}
```

### File Upload Limits

```javascript
upload: {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  allowedCsvTypes: ['text/csv', 'application/csv']
}
```

## 🐛 Troubleshooting

### Lỗi kết nối MongoDB

```bash
# Kiểm tra MongoDB local
mongod --version
net start MongoDB  # Windows
brew services start mongodb-community  # macOS
sudo systemctl start mongod  # Linux
```

### Lỗi CORS

- Kiểm tra `CORS_ORIGIN` trong environment variables
- Đảm bảo frontend URL đúng format
- Thử `CORS_ORIGIN=*` cho development

### Lỗi Cloudinary

- Kiểm tra credentials trong environment variables
- Đảm bảo cloud name, api key, api secret đúng
- Kiểm tra quyền upload trong Cloudinary dashboard

### Lỗi Build

```bash
# Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Client
cd client
rm -rf node_modules package-lock.json
npm install
```

## 📊 Monitoring

### Logs

- **Development:** Console logs với debug info
- **Production:** Render logs hoặc Vercel logs

### Health Check

API endpoint: `GET /api/health-check`

### Performance

- Sử dụng MongoDB Atlas monitoring
- Cloudinary analytics cho ảnh
- Vercel analytics cho frontend

## 🔒 Security

### Environment Variables

- Không commit `.env` files
- Sử dụng secrets management của platform
- Rotate credentials định kỳ

### API Security

- Rate limiting
- Input validation
- File type validation
- CORS configuration

## 📈 Scaling

### Database

- MongoDB Atlas auto-scaling
- Index optimization
- Connection pooling

### Application

- Render auto-scaling
- CDN cho static assets
- Image optimization với Cloudinary

## 🆘 Support

Nếu gặp vấn đề:

1. Kiểm tra logs
2. Verify environment variables
3. Test API endpoints
4. Check network connectivity
5. Review platform documentation
