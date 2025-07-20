# Tổng hợp & Phân tích Project Flashcard

## 1. Tổng quan

- **Tên project:** Flashcard App
- **Mục đích:** Ứng dụng web học từ vựng qua flashcard, quiz, quản lý chủ đề/ngôn ngữ, thống kê tiến độ học tập.
- **Công nghệ sử dụng:**
  - **Frontend:** React 18, React Router DOM, Axios, Tailwind CSS, Lucide React
  - **Backend:** Node.js, Express.js, **MongoDB (Mongoose)**, Multer (upload), CSV Parser
  - **CSDL:** MongoDB (xác nhận qua code và README)

---

## 2. Cấu trúc thư mục

| Thư mục/File                | Vai trò chính                                                                                            |
| --------------------------- | -------------------------------------------------------------------------------------------------------- |
| `client/`                   | Toàn bộ mã nguồn frontend (React app)                                                                    |
| `client/src/components/`    | Chứa các component React chia theo chức năng (dashboard, edit, home, quiz, statistics, util, vocabulary) |
| `client/src/hooks/`         | Chứa custom hooks (nếu có)                                                                               |
| `client/public/`            | File tĩnh, index.html, favicon, v.v.                                                                     |
| `client/index.js`           | Điểm khởi đầu của React app                                                                              |
| `client/App.js`             | Component gốc, định nghĩa router, layout                                                                 |
| `client/axiosConfig.js`     | Cấu hình axios cho các request API                                                                       |
| `client/index.css`          | CSS gốc                                                                                                  |
| `client/tailwind.config.js` | Cấu hình TailwindCSS                                                                                     |
| `server/`                   | Backend Node.js, file chính: `server/index.js`                                                           |
| `uploads/`                  | Thư mục lưu file upload (CSV, v.v.)                                                                      |
| `*.csv`                     | File mẫu dữ liệu từ vựng                                                                                 |
| `README.md`                 | Hướng dẫn sử dụng, mô tả project                                                                         |
| `.gitignore`                | File cấu hình git                                                                                        |
| `package.json`              | Quản lý dependencies, scripts cho project                                                                |

**File/component/api quan trọng:**

- `client/src/components/quiz/Quiz.js`: Màn hình làm quiz
- `client/src/components/vocabulary/VocabularyManager.js`: Quản lý từ vựng
- `client/src/components/statistics/StatisticsPage.js`: Thống kê
- `client/src/components/edit/EditVocabulary.js`: Sửa từ vựng
- `client/src/components/home/HomePage.js`: Trang chủ
- `server/index.js`: API backend chính

---

## 3. Giao diện người dùng (UI flow)

### 3.1. Trang chủ (Home)

- **File:** `client/src/components/home/HomePage.js`
- **Chức năng:** Giới thiệu, điều hướng đến các chức năng chính (quiz, quản lý từ vựng, thống kê)
- **Thành phần UI:** Button, link, card
- **Tương tác backend:** Không trực tiếp, chủ yếu điều hướng

### 3.2. Dashboard

- **File:** `client/src/components/dashboard/Dashboard.js`
- **Chức năng:** Thống kê tổng quan số lượng từ vựng theo ngôn ngữ, chủ đề
- **Thành phần UI:** Card, biểu đồ nhỏ, số liệu tổng hợp
- **Tương tác backend:**
  - Gọi API `GET /api/dashboard` lấy thống kê

### 3.3. Thống kê (Statistics)

- **File:** `client/src/components/statistics/StatisticsPage.js`, `LanguageBarChart.js`, ...
- **Chức năng:** Hiển thị biểu đồ thống kê kết quả học tập, số lượng từ vựng, tiến độ học
- **Thành phần UI:** Biểu đồ (Chart.js), bảng, filter
- **Tương tác backend:**
  - Gọi API `GET /api/dashboard` hoặc các API thống kê khác

### 3.4. Quản lý từ vựng (Vocabulary Manager)

- **File:** `client/src/components/vocabulary/VocabularyManager.js`, `VocabularyList.js`
- **Chức năng:** Xem, thêm, sửa, xóa từ vựng; import/export CSV
- **Thành phần UI:** Bảng (table), form nhập liệu, button (add, edit, delete), upload file
- **Tương tác backend:**
  - `GET /api/vocabulary` - Lấy danh sách từ vựng
  - `POST /api/vocabulary` - Thêm từ vựng
  - `PUT /api/vocabulary/:id` - Sửa từ vựng
  - `DELETE /api/vocabulary/:id` - Xóa từ vựng
  - `POST /api/vocabulary/bulk` - Import từ CSV

### 3.5. Làm quiz (Quiz)

- **File:** `client/src/components/quiz/Quiz.js`
- **Chức năng:** Làm bài kiểm tra từ vựng, chấm điểm, hiển thị kết quả
- **Thành phần UI:** Câu hỏi, lựa chọn đáp án, button Next/Submit, hiển thị kết quả
- **Tương tác backend:**
  - `GET /api/quiz?type=...&count=...` - Lấy danh sách câu hỏi quiz

### 3.6. Quản lý chủ đề/ngôn ngữ (Edit)

- **File:** `client/src/components/edit/EditLanguage.js`, `EditTopic.js`, `EditVocabulary.js`
- **Chức năng:** Thêm/sửa/xóa chủ đề, ngôn ngữ, từ vựng
- **Thành phần UI:** Form, bảng, button
- **Tương tác backend:**
  - `GET /api/topics/:language` - Lấy danh sách chủ đề
  - `GET /api/languages` - Lấy danh sách ngôn ngữ
  - `DELETE /api/vocabulary/topic/:topic` - Xóa toàn bộ từ vựng theo chủ đề
  - `DELETE /api/vocabulary/language/:language` - Xóa toàn bộ từ vựng theo ngôn ngữ

---

## 4. Frontend logic

- **Component chính:**
  - `App.js`: Định nghĩa router, layout tổng thể
  - Các component chia theo chức năng (quiz, vocabulary, statistics, edit, dashboard, home)
- **Điều hướng giữa các trang:**
  - Sử dụng **React Router** (BrowserRouter, Route, Routes)
- **State, hook, context:**
  - Sử dụng **useState**, **useEffect** cho quản lý state cục bộ
  - Có thể có custom hook trong `client/src/hooks/`
  - Không dùng Redux hay Context API lớn
- **Giao tiếp backend:**
  - Sử dụng **axios** (cấu hình trong `axiosConfig.js`)
  - Gọi API trong các component khi mount hoặc khi user thao tác (add/edit/delete...)

---

## 5. Backend

- **File chính:** `server/index.js`
- **API endpoints chính:**
  - `GET /api/vocabulary` - Lấy danh sách từ vựng
  - `POST /api/vocabulary` - Thêm từ vựng mới
  - `PUT /api/vocabulary/:id` - Sửa từ vựng
  - `DELETE /api/vocabulary/:id` - Xóa từ vựng
  - `POST /api/vocabulary/bulk` - Import từ CSV
  - `GET /api/dashboard` - Lấy thống kê
  - `GET /api/quiz` - Lấy câu hỏi quiz
  - `GET /api/topics/:language` - Lấy chủ đề theo ngôn ngữ
  - `GET /api/languages` - Lấy danh sách ngôn ngữ
  - `DELETE /api/vocabulary/topic/:topic` - Xóa từ vựng theo chủ đề
  - `DELETE /api/vocabulary/language/:language` - Xóa từ vựng theo ngôn ngữ
  - `GET /api/vocabulary/:id` - Lấy chi tiết từ vựng
- **Xử lý dữ liệu:**
  - Sử dụng **MongoDB** với **Mongoose**
  - Schema chính: `Vocabulary` (word, meaning, imageUrl, language, topic, createdAt)
  - Xử lý import/export file CSV, kiểm tra trùng lặp, validate dữ liệu
- **Authentication, middleware, validation:**
  - Không có xác thực phức tạp
  - Có middleware cho upload file (multer), parse CSV
  - Validation cơ bản ở backend (bắt buộc trường word, meaning, topic...)

---

## 6. Kết nối Frontend ↔ Backend

- **Frontend gọi API:**
  - Qua **axios** (cấu hình trong `axiosConfig.js`)
  - Gọi các endpoint `/api/vocabulary`, `/api/quiz`, `/api/dashboard`, v.v.
- **Cách gọi:**
  - Sử dụng axios trong các component khi cần lấy/gửi dữ liệu
  - Có thể có interceptor hoặc cấu hình baseURL trong `axiosConfig.js`

---

## 7. Tài liệu kỹ thuật

### 7.1. Tài liệu hiện có

- `doc/02_quiz.md`: Hướng dẫn chi tiết về tính năng Quiz và bảo vệ thoát bài kiểm tra
- `doc/03_confirmation_system.md`: Chi tiết về hệ thống xác nhận và mật khẩu
- `README.md`: Hướng dẫn sử dụng và cài đặt

### 7.2. Hệ thống bảo mật

- **Popup xác nhận**: Sử dụng `AlertManager.js` và `CustomAlert.js`
- **Mật khẩu hệ thống**: `357689` cho các thao tác quan trọng
- **Phân loại thao tác**:
  - 🔴 Yêu cầu mật khẩu: Xóa từ vựng, chủ đề, ngôn ngữ
  - 🟢 Không yêu cầu mật khẩu: Thoát bài kiểm tra, chỉnh sửa

## Kết luận

- Project **flashcard** là ứng dụng học từ vựng dạng flashcard, có đủ chức năng quản lý, làm quiz, thống kê.
- **Dùng MongoDB** làm database chính (xác nhận qua code và README)
- Cấu trúc rõ ràng, chia component theo chức năng, API backend đơn giản, dễ mở rộng.
- **Hệ thống bảo mật** được thiết kế thông minh với popup xác nhận và mật khẩu cho các thao tác quan trọng.
- Dễ dàng phát triển thêm các tính năng nâng cao như đăng nhập, lưu lịch sử, học offline...
