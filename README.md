# Flashcard App - Ứng dụng học từ vựng

Ứng dụng web học từ vựng với flashcards và bài kiểm tra tương tác, được xây dựng bằng React, Node.js và MongoDB.

## Tính năng chính

### Quản lý từ vựng

- ✅ Thêm từ vựng mới thủ công
- ✅ Import từ vựng từ file CSV theo chủ đề
- ✅ Mỗi từ bao gồm: từ vựng, nghĩa, hình ảnh (URL), ngôn ngữ, chủ đề
- ✅ Xem danh sách và xóa từ vựng
- ✅ Dashboard thống kê theo ngôn ngữ và titles

### Bài kiểm tra tự động

- ✅ Dạng 1: Nhìn hình ảnh → chọn đúng từ trong 4 đáp án
- ✅ Dạng 2: Nhìn từ → chọn đúng hình ảnh trong 4 hình
- ✅ Đáp án sai được chọn ngẫu nhiên từ các từ khác
- ✅ Hiển thị kết quả và điểm số
- ✅ Tùy chọn số câu hỏi (5, 10, 15, 20)

## Công nghệ sử dụng

### Frontend

- React 18
- React Router DOM
- Axios
- Tailwind CSS
- Lucide React (icons)

### Backend

- Node.js
- Express.js
- MongoDB với Mongoose
- Multer (upload file)
- CSV Parser

## Cài đặt và chạy

### Yêu cầu hệ thống

- Node.js (version 14 trở lên)
- MongoDB (local hoặc cloud)
- npm hoặc yarn

### Bước 1: Clone và cài đặt dependencies

```bash
cd flashcard
npm run install-all
```

### Bước 2: Cấu hình MongoDB

Tạo file `.env` trong thư mục gốc:

```env
MONGODB_URI=mongodb://localhost:27017/flashcard-app
PORT=5000
```

### Bước 3: Chạy ứng dụng

```bash
# Chạy cả frontend và backend
npm run dev

# Hoặc chạy riêng lẻ
npm run server    # Backend (port 5000)
npm run client    # Frontend (port 3000)
```

### Bước 4: Truy cập ứng dụng

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Cấu trúc dự án

```
flashcard/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   └── package.json
├── server/                 # Node.js backend
│   └── index.js           # Express server
├── package.json           # Root package.json
└── README.md
```

## API Endpoints

### Vocabulary Management

- `GET /api/vocabulary` - Lấy danh sách từ vựng
- `POST /api/vocabulary` - Thêm từ vựng mới
- `POST /api/vocabulary/bulk` - Import từ CSV theo chủ đề
- `DELETE /api/vocabulary/:id` - Xóa từ vựng

### Dashboard

- `GET /api/dashboard` - Lấy thống kê theo ngôn ngữ và chủ đề

### Quiz

- `GET /api/quiz?type=word-to-image&count=10` - Tạo bài kiểm tra

## Format CSV

File CSV để import từ vựng cần có các cột:

```csv
word,meaning,imageUrl,language
apple,táo,https://example.com/apple.jpg,english
banana,chuối,https://example.com/banana.jpg,english
```

**Lưu ý về hình ảnh:**

- Nếu URL hình ảnh không hợp lệ hoặc không tải được, sẽ hiển thị "Not found"
- Có thể sử dụng các dịch vụ như Picsum Photos để tạo hình ảnh mẫu
- File `example-vocabulary-simple.csv` chứa các link hình ảnh đáng tin cậy

## Sử dụng

1. **Dashboard**: Xem thống kê tổng quan theo ngôn ngữ và chủ đề
2. **Thêm từ vựng**: Vào trang "Quản lý từ vựng" để thêm từ mới hoặc import CSV theo chủ đề
3. **Làm bài kiểm tra**: Vào trang "Bài kiểm tra" để luyện tập
4. **Theo dõi tiến độ**: Xem kết quả và điểm số sau mỗi bài kiểm tra

## Tính năng nâng cao (có thể phát triển thêm)

- [ ] Đăng nhập/đăng ký người dùng
- [ ] Lưu lịch sử bài kiểm tra
- [ ] Thống kê học tập
- [ ] Flashcards với hiệu ứng lật
- [ ] Upload hình ảnh thay vì chỉ URL
- [ ] Phát âm từ vựng
- [ ] Chế độ học offline

## Đóng góp

Mọi đóng góp đều được chào đón! Hãy tạo issue hoặc pull request.

## License

MIT License

## Bảo vệ thao tác xóa dữ liệu

- Tất cả các thao tác xóa ngôn ngữ hoặc chủ đề đều yêu cầu xác nhận 2 bước:
  1. Xác nhận ý định xóa qua popup.
  2. Nhập đúng mật khẩu 6 số để xác nhận xóa.
- Nếu nhập sai mật khẩu, thao tác xóa sẽ không được thực hiện.
