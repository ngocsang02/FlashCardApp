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

## Các file liên quan

- `client/src/components/vocabulary/VocabularyManager.js`
- `client/src/components/vocabulary/VocabularyList.js`
- `client/src/components/edit/EditVocabulary.js`
- `client/src/components/edit/EditTopic.js`
- `client/src/components/edit/EditLanguage.js`
- API: `/api/vocabulary`, `/api/vocabulary/bulk`, `/api/vocabulary/:id`

## Hướng dẫn sử dụng

1. Vào trang "Quản lý từ vựng" từ trang chủ.
2. Để thêm từ mới, nhấn nút "Thêm từ vựng", điền thông tin và lưu lại.
3. Để import từ file CSV, chọn file, nhập chủ đề/ngôn ngữ và nhấn "Import".
4. Để sửa/xóa từ, nhấn vào biểu tượng chỉnh sửa/xóa bên cạnh từ vựng.
5. Có thể lọc từ vựng theo ngôn ngữ/chủ đề bằng các bộ lọc phía trên danh sách.

> Lưu ý: File CSV mẫu có thể tham khảo tại thư mục gốc dự án (ví dụ: `example-vocabulary.csv`).
