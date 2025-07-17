# Trang chủ & Hướng dẫn sử dụng

## Mô tả

Trang chủ giới thiệu ứng dụng, các tính năng chính và hướng dẫn sử dụng cơ bản cho người mới.

## Luồng code (Code flow)

### 1. Hiển thị giới thiệu và các tính năng chính

- **Component:** `HomePage.js`
  - Hiển thị các khối chức năng: Quản lý từ vựng, Làm bài kiểm tra, Thống kê tiến độ.
  - Mỗi khối có nút điều hướng tới các trang tương ứng (`/vocabulary`, `/quiz`, `/statistics`).

### 2. Hướng dẫn sử dụng cơ bản

- **Component:** `HomePage.js`
  - Hiển thị các bước hướng dẫn sử dụng (thêm từ vựng, làm bài kiểm tra, xem thống kê).
  - Các bước này chỉ là hiển thị tĩnh, không có xử lý logic phức tạp.

## Các file liên quan

- `client/src/components/home/HomePage.js`

## Hướng dẫn sử dụng

1. Đọc phần giới thiệu để hiểu mục đích ứng dụng.
2. Làm theo các bước hướng dẫn sử dụng:
   - Thêm từ vựng mới hoặc import từ file CSV.
   - Làm bài kiểm tra với các từ đã thêm.
   - Xem thống kê quá trình học tập.
3. Sử dụng các nút điều hướng trên trang chủ để truy cập nhanh các tính năng chính.

> Lưu ý: Nếu gặp khó khăn, hãy xem thêm các file hướng dẫn chi tiết cho từng tính năng trong thư mục doc/.
