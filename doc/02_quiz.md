# Làm bài kiểm tra (Quiz)

## Mô tả

Tính năng này cho phép người dùng luyện tập từ vựng thông qua các bài kiểm tra tự động sinh từ danh sách từ vựng đã có. Hỗ trợ nhiều loại câu hỏi (chọn hình, chọn từ, điền từ, chọn nghĩa), chọn số lượng câu hỏi, ngôn ngữ, chủ đề.

### Các loại bài kiểm tra:

- **Nhìn từ → Chọn hình** (`word-to-image`): Hiển thị từ, chọn hình ảnh đúng.
- **Nhìn hình → Chọn từ** (`image-to-word`): Hiển thị hình, chọn từ đúng.
- **Điền từ vào hình** (`image-fill-word`): Hiển thị hình, người dùng tự điền từ.
- **Từ chọn nghĩa** (`word-to-meaning`): Hiển thị từ, chọn nghĩa đúng trong 4 đáp án.
- **Hỗn hợp** (`mixed`): Ngẫu nhiên các loại trên.

## Luồng xử lý chính

- Chọn loại bài kiểm tra, số lượng câu hỏi, ngôn ngữ, chủ đề.
- Sinh ngẫu nhiên các câu hỏi từ danh sách từ vựng.
- Hiển thị câu hỏi, nhận đáp án, chấm điểm và hiển thị kết quả.
- Hiển thị đáp án đúng/sai, điểm số cuối cùng.

## Luồng code (Code flow)

### 1. Khởi tạo và cấu hình bài kiểm tra

- **Component:** `Quiz.js`
- **State:** `quizType`, `questionCount`, `selectedLanguage`, `selectedTopic`, ...
- Khi người dùng chọn cấu hình, các state này sẽ được cập nhật.

### 2. Lấy danh sách ngôn ngữ và chủ đề

- **useEffect:** Khi component mount, gọi API `/api/languages` để lấy danh sách ngôn ngữ.
- Khi chọn ngôn ngữ, gọi API `/api/topics/:language` để lấy chủ đề tương ứng.

### 3. Bắt đầu bài kiểm tra

- **Hàm:** `startQuiz()`
  - Gọi API `GET /api/quiz?type=...&count=...&language=...&topic=...` để lấy danh sách câu hỏi.
  - Cập nhật state `questions`, `currentQuestion`, `score`, ...
  - Đặt `isQuizActive = true` để bắt đầu bài kiểm tra.

### 4. Trả lời câu hỏi

- **Hàm:** `handleAnswerSelect(answerId)`
  - Kiểm tra đáp án, cập nhật điểm số, hiển thị đáp án đúng/sai.
  - Nếu đúng, tự động chuyển sang câu tiếp theo sau 1s; nếu sai, hiển thị đáp án đúng.
  - Với loại "Từ chọn nghĩa", hiển thị từ, chọn nghĩa đúng trong 4 đáp án.

### 5. Chuyển câu hỏi và kết thúc bài kiểm tra

- **Hàm:** `nextQuestion()`
  - Tăng chỉ số câu hỏi hiện tại, nếu hết thì hiển thị kết quả tổng kết (`showResult = true`).

### 6. Làm lại bài kiểm tra

- **Hàm:** `resetQuiz()`
  - Reset toàn bộ state về ban đầu để người dùng có thể làm lại bài mới.

### 7. Bảo vệ thoát bài kiểm tra

- **useEffect:** Lắng nghe sự kiện `beforeunload` để cảnh báo khi người dùng đóng tab/trình duyệt.
- **useEffect:** Intercept click vào các link nội bộ khi đang làm bài kiểm tra.
- **Popup xác nhận:** Hiển thị popup xác nhận đơn giản (không yêu cầu mật khẩu) khi:
  - Click vào link khác trong khi đang làm bài
  - Click nút "Thoát bài kiểm tra"
- **Config:** `requirePassword: false` để bỏ qua bước nhập mật khẩu cho riêng chức năng thoát bài kiểm tra.

## Các file liên quan

- `client/src/components/quiz/Quiz.js`
- `client/src/components/util/AlertManager.js`
- `client/src/components/util/CustomAlert.js`
- API: `/api/quiz`, `/api/languages`, `/api/topics/:language`
- Backend: `server/index.js` (xử lý sinh câu hỏi cho các loại quiz, bao gồm loại mới "Từ chọn nghĩa")

## Hướng dẫn sử dụng

1. Vào trang "Bài kiểm tra" từ trang chủ.
2. Chọn ngôn ngữ, chủ đề, loại bài kiểm tra (bao gồm "Từ → Nghĩa") và số lượng câu hỏi.
3. Nhấn "Bắt đầu" để làm bài.
4. Trả lời từng câu hỏi, xem kết quả và đáp án sau khi hoàn thành.
5. Có thể làm lại bài kiểm tra hoặc thay đổi cấu hình để luyện tập tiếp.

## Tính năng bảo vệ và thoát bài kiểm tra

### Bảo vệ thoát không mong muốn

- **Cảnh báo đóng tab:** Khi người dùng đóng tab hoặc refresh trang trong khi đang làm bài, hiển thị cảnh báo.
- **Intercept navigation:** Chặn click vào các link nội bộ khi đang làm bài kiểm tra.
- **Popup xác nhận:** Hiển thị popup xác nhận trước khi cho phép thoát.

### Thoát bài kiểm tra

- **Nút "Thoát bài kiểm tra":** Hiển thị ở góc phải trên cùng trong khi làm bài.
- **Popup xác nhận đơn giản:** Chỉ yêu cầu xác nhận, không cần nhập mật khẩu.
- **Reset state:** Khi xác nhận thoát, reset toàn bộ state về ban đầu.

### Khác biệt với các chức năng khác

- **Thoát bài kiểm tra:** Chỉ cần popup xác nhận đơn giản (`requirePassword: false`)
- **Xóa từ vựng/chủ đề/ngôn ngữ:** Vẫn yêu cầu nhập mật khẩu (`requirePassword: true`)

## Ví dụ minh họa: Loại "Từ chọn nghĩa" (word-to-meaning)

### Mô tả

- Hệ thống hiển thị một từ vựng, ví dụ: **"apple"**
- Có 4 đáp án là nghĩa, ví dụ:
  1. Quả táo
  2. Quả chuối
  3. Quả cam
  4. Quả dưa hấu
- Người dùng chọn đáp án đúng (Quả táo).

### Dữ liệu mẫu trả về từ API

```json
{
  "type": "word-to-meaning",
  "question": "apple",
  "answers": [
    { "id": "1", "text": "Quả táo", "isCorrect": true },
    { "id": "2", "text": "Quả chuối", "isCorrect": false },
    { "id": "3", "text": "Quả cam", "isCorrect": false },
    { "id": "4", "text": "Quả dưa hấu", "isCorrect": false }
  ]
}
```

### Giao diện minh họa

- **Câu hỏi:**
  > Chọn nghĩa đúng cho từ này:
  >
  > **apple**
- **Đáp án:**
  - [ ] Quả táo
  - [ ] Quả chuối
  - [ ] Quả cam
  - [ ] Quả dưa hấu

Người dùng chọn đáp án, hệ thống sẽ báo đúng/sai và chuyển sang câu tiếp theo.

<!-- Nếu muốn chèn hình ảnh thực tế, hãy thêm ảnh chụp màn hình giao diện quiz tại đây. -->
