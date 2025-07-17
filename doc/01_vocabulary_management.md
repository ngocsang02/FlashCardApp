# Quản lý từ vựng (Vocabulary Management)

## Mô tả

Tính năng này cho phép người dùng thêm, sửa, xóa, xem và import từ vựng theo chủ đề và ngôn ngữ. Hỗ trợ import từ file CSV, quản lý từ vựng theo nhóm, chủ đề, ngôn ngữ.

## Luồng xử lý chính

- Lấy danh sách từ vựng từ server và lưu cache localStorage.
- Thêm từ vựng mới (có thể upload ảnh hoặc nhập URL ảnh).
- Import từ vựng từ file CSV (theo chủ đề/ngôn ngữ).
- Sửa/xóa từ vựng.
- Lọc, tìm kiếm từ vựng theo chủ đề/ngôn ngữ.

## Luồng code (Code flow)

### 1. Lấy danh sách từ vựng

- **Component:** `VocabularyManager.js`
- **Hàm:** `fetchVocabularies()`
  - Gọi API `GET /api/vocabulary` lấy toàn bộ từ vựng.
  - Lưu dữ liệu vào state `vocabularies` và localStorage.
  - Khi component mount hoặc sau khi thêm/xóa/sửa/import từ vựng đều gọi lại hàm này để cập nhật dữ liệu.

### 2. Thêm từ vựng mới

- **Component:** `VocabularyManager.js`
- **Hàm:** `handleSubmit()`
  - Lấy dữ liệu từ form, kiểm tra nếu có upload ảnh thì gọi `uploadImage()` để upload ảnh lên server.
  - Gọi API `POST /api/vocabulary` để thêm từ mới.
  - Sau khi thành công, reset form và gọi lại `fetchVocabularies()` để cập nhật danh sách.

### 3. Import từ vựng từ file CSV

- **Component:** `VocabularyManager.js`
- **Hàm:** `handleCsvUpload()`
  - Lấy file CSV, chủ đề, ngôn ngữ từ form.
  - Gửi file lên server qua API `POST /api/vocabulary/bulk` (dạng multipart/form-data).
  - Sau khi thành công, gọi lại `fetchVocabularies()` để cập nhật danh sách.

### 4. Sửa từ vựng

- **Component:** `EditVocabulary.js`
- **Hàm:** `handleSave()`
  - Lấy dữ liệu từ form, gọi API `PUT /api/vocabulary/:id` để cập nhật từ vựng.
  - Sau khi thành công, fetch lại dữ liệu từ server để cập nhật giao diện.

### 5. Xóa từ vựng

- **Component:** `VocabularyManager.js` hoặc `EditVocabulary.js`
- **Hàm:** `handleDelete(id)`
  - Gọi API `DELETE /api/vocabulary/:id` để xóa từ vựng.
  - Sau khi thành công, gọi lại `fetchVocabularies()` để cập nhật danh sách.

### 6. Lọc/tìm kiếm từ vựng

- **Component:** `VocabularyManager.js`, `VocabularyList.js`
- **State:** `expandedLanguages`, `expandedTopics`, `showList`, ...
  - Dữ liệu được lọc theo ngôn ngữ/chủ đề bằng các state và props truyền xuống component con.
  - Khi thay đổi bộ lọc, gọi lại API hoặc lọc dữ liệu đã có trong state/localStorage.

### 7. Sửa/xóa chủ đề, ngôn ngữ

- **Component:** `EditTopic.js`, `EditLanguage.js`
- **API:** `/api/vocabulary/topic/:topic`, `/api/vocabulary/language/:language`
  - Cho phép đổi tên, xóa chủ đề/ngôn ngữ và cập nhật lại danh sách từ vựng liên quan.

## Tính năng nâng cao về quản lý hình ảnh (2024)

- Hỗ trợ dán trực tiếp hình ảnh từ clipboard vào ô URL hình ảnh. Nếu paste là file ảnh, hệ thống sẽ tự động upload lên server và điền URL trả về vào input.
- Nếu paste là link ảnh, hệ thống sẽ tự động load ảnh preview.
- Khi click vào ảnh preview nhỏ sẽ mở modal xem trước ảnh lớn ở giữa màn hình, tự động căn giữa, tối ưu cho cả desktop và mobile.
- Nếu người dùng xóa đường dẫn ảnh hoặc đóng form thêm từ mới, hệ thống sẽ tự động xóa file ảnh upload khỏi server để tránh file rác.
- Nếu thêm từ mới thất bại, ảnh upload cũng sẽ được xóa tự động.
- Chỉ cho phép mỗi từ vựng có 1 ảnh duy nhất.
- Ảnh upload sẽ được lưu vào thư mục `uploads/` trên server, và có thể truy cập qua URL `/uploads/tenfile.png`.

## Các file liên quan

- `
