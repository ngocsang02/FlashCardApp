# Thống kê học tập (Statistics)

## Mô tả

Tính năng này giúp người dùng theo dõi tiến độ học tập, tỷ lệ đúng theo loại câu hỏi, theo ngày/giờ, tổng số bài kiểm tra, tỷ lệ đúng trung bình, số từ đã học.

## Luồng xử lý chính

- Lấy dữ liệu thống kê từ server (theo ngôn ngữ, chủ đề).
- Hiển thị biểu đồ tỷ lệ đúng theo ngày/giờ, loại câu hỏi.
- Hiển thị tổng số bài kiểm tra, tỷ lệ đúng trung bình, số từ đã học.

## Luồng code (Code flow)

### 1. Lấy danh sách ngôn ngữ có dữ liệu thống kê

- **Component:** `StatisticsPage.js`
- **Hàm:** `fetchAvailableLanguages()`
  - Gọi API `/api/vocabulary/languages-with-topic` để lấy danh sách ngôn ngữ có dữ liệu.
  - Cập nhật state `availableLanguages`, `selectedLanguage`.

### 2. Hiển thị biểu đồ thống kê

- **Component:** `StatisticsPage.js`
- **Component con:** `LanguageLineChart`, `LanguageBarChart`, `QuestionTypeLineChart`, `QuestionTypeBarChart`
  - Truyền prop `selectedLanguage` xuống các component con.
  - Mỗi component con sẽ tự gọi API để lấy dữ liệu thống kê phù hợp và hiển thị biểu đồ.

### 3. Hiển thị số liệu tổng hợp

- **Component:** `StatisticsPage.js`
  - Hiển thị tổng số bài kiểm tra, tỷ lệ đúng trung bình, số từ đã học (có thể lấy từ API hoặc tính toán từ dữ liệu đã fetch).

## Các file liên quan

- `client/src/components/statistics/StatisticsPage.js`
- `client/src/components/statistics/LanguageBarChart.js`
- `client/src/components/statistics/LanguageLineChart.js`
- `client/src/components/statistics/QuestionTypeBarChart.js`
- `client/src/components/statistics/QuestionTypeLineChart.js`
- API: `/api/vocabulary/languages-with-topic`

## Hướng dẫn sử dụng

1. Vào trang "Thống kê" từ trang chủ.
2. Chọn ngôn ngữ muốn xem thống kê.
3. Xem các biểu đồ và số liệu tổng hợp về quá trình học tập.
4. Nếu chưa có dữ liệu, hãy thêm từ vựng và làm bài kiểm tra để có thống kê.
