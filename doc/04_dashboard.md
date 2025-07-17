# Dashboard tổng quan

## Mô tả

Dashboard cung cấp cái nhìn tổng quan về số lượng từ vựng, chủ đề, ngôn ngữ, cho phép quản lý nhanh các nhóm từ, chủ đề, ngôn ngữ.

## Luồng xử lý chính

- Lấy dữ liệu tổng quan từ server (số lượng từ, chủ đề, ngôn ngữ).
- Hiển thị danh sách, cho phép lọc theo ngôn ngữ/chủ đề.
- Chỉnh sửa/xóa nhanh chủ đề, ngôn ngữ, từ vựng.

## Luồng code (Code flow)

### 1. Lấy dữ liệu tổng quan

- **Component:** `Dashboard.js`
- **Hàm:** `fetchDashboardStats()`
  - Gọi API `/api/dashboard` để lấy số lượng từ vựng, chủ đề, ngôn ngữ.
  - Lưu vào state `stats`.

### 2. Lọc và hiển thị từ vựng

- **Component:** `Dashboard.js`
- **Hàm:** `fetchVocabularies()`
  - Gọi API `/api/vocabulary` với params `language`, `topic` để lấy danh sách từ vựng theo bộ lọc.
  - Lưu vào state `vocabularies`.

### 3. Xóa/chỉnh sửa chủ đề, ngôn ngữ, từ vựng

- **Component:** `Dashboard.js`
- **Hàm:** `handleDeleteTopic(language, topic)`, `handleDeleteLanguage(language)`, `handleEditLanguage(language)`, `handleEditTopic(language, topic)`, `handleEditVocabulary(id)`, `handleDeleteVocabulary(id)`
  - Gọi các API tương ứng để xóa/chỉnh sửa dữ liệu.
  - Sau khi thao tác, gọi lại `fetchDashboardStats()` và `fetchVocabularies()` để cập nhật giao diện.

### 4. Khôi phục bộ lọc và vị trí scroll khi quay lại

- **Component:** `Dashboard.js`
- **useEffect:** Khi quay lại trang, lấy lại state bộ lọc và vị trí scroll từ `location.state` để giữ trải nghiệm người dùng.

## Các file liên quan

- `client/src/components/dashboard/Dashboard.js`
- API: `/api/dashboard`, `/api/vocabulary`, `/api/vocabulary/topic/:topic`, `/api/vocabulary/language/:language`

## Hướng dẫn sử dụng

1. Vào trang "Dashboard" (nếu có menu hoặc truy cập trực tiếp).
2. Xem tổng quan số lượng từ vựng, chủ đề, ngôn ngữ.
3. Lọc theo ngôn ngữ/chủ đề để xem chi tiết.
4. Sử dụng các nút chỉnh sửa/xóa để thao tác nhanh với chủ đề, ngôn ngữ, từ vựng.
