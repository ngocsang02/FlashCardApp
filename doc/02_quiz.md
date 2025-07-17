# Làm bài kiểm tra (Quiz)

## Mô tả

Tính năng này cho phép người dùng luyện tập từ vựng thông qua các bài kiểm tra tự động sinh từ danh sách từ vựng đã có. Hỗ trợ nhiều loại câu hỏi (chọn hình, chọn từ, điền từ), chọn số lượng câu hỏi, ngôn ngữ, chủ đề.

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

### 5. Chuyển câu hỏi và kết thúc bài kiểm tra

- **Hàm:** `nextQuestion()`
  - Tăng chỉ số câu hỏi hiện tại, nếu hết thì hiển thị kết quả tổng kết (`showResult = true`).

### 6. Làm lại bài kiểm tra

- **Hàm:** `resetQuiz()`
  - Reset toàn bộ state về ban đầu để người dùng có thể làm lại bài mới.

## Các file liên quan

- `client/src/components/quiz/Quiz.js`
- API: `/api/quiz`, `/api/languages`, `/api/topics/:language`

## Hướng dẫn sử dụng

1. Vào trang "Bài kiểm tra" từ trang chủ.
2. Chọn ngôn ngữ, chủ đề, loại bài kiểm tra và số lượng câu hỏi.
3. Nhấn "Bắt đầu" để làm bài.
4. Trả lời từng câu hỏi, xem kết quả và đáp án sau khi hoàn thành.
5. Có thể làm lại bài kiểm tra hoặc thay đổi cấu hình để luyện tập tiếp.
