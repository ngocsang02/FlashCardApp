import React from 'react';
import { BookOpen, Facebook, Instagram, Mail, Github } from 'lucide-react';

function AboutPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10 flex flex-col items-center justify-center select-none pt-8">
          <span className="mb-2">
            <BookOpen className="h-14 w-14 drop-shadow-lg text-transparent bg-gradient-to-tr from-purple-400 via-pink-400 to-orange-500 bg-clip-text" />
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-gradient-to-tr from-purple-600 via-pink-600 to-orange-600 bg-clip-text drop-shadow-lg tracking-tight mb-2 px-4 py-2 text-center leading-tight">
            Về dự án
          </h1>
          <span className="text-base text-gray-500 font-medium mb-4">Giới thiệu về Flashcard App</span>
          <div className="w-24 h-1 rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 mb-2" />
        </div>

        {/* Project Introduction */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Flashcard App</h2>
          
          <div className="space-y-6 text-gray-700">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">🎯 Mục tiêu</h3>
              <p className="text-lg leading-relaxed">
                Flashcard App là một ứng dụng học từ vựng thông minh, được thiết kế để giúp người dùng học và ghi nhớ từ vựng một cách hiệu quả thông qua phương pháp flashcard truyền thống kết hợp với công nghệ hiện đại.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">✨ Tính năng chính</h3>
              <ul className="space-y-2 text-lg">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Quản lý từ vựng theo ngôn ngữ và chủ đề</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Học từ vựng với hình ảnh minh họa</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Bài kiểm tra đa dạng: nhìn từ chọn hình, nhìn hình chọn từ</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Thống kê chi tiết về tiến độ học tập</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Giao diện thân thiện, responsive trên mọi thiết bị</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">🎓 Phương pháp học tập</h3>
              <p className="text-lg leading-relaxed mb-4">
                Flashcard App áp dụng các nguyên lý khoa học về ghi nhớ và học tập hiệu quả:
              </p>
              <ul className="space-y-2 text-lg">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span><strong>Spaced Repetition:</strong> Lặp lại thông tin theo khoảng thời gian tối ưu</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span><strong>Visual Learning:</strong> Học qua hình ảnh giúp ghi nhớ tốt hơn 65%</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span><strong>Active Recall:</strong> Kích hoạt trí nhớ thông qua bài kiểm tra</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span><strong>Progress Tracking:</strong> Theo dõi tiến độ để duy trì động lực</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">🌟 Lợi ích</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                  <h4 className="font-semibold text-blue-900 mb-2">📚 Cho học sinh</h4>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li>• Học từ vựng hiệu quả</li>
                    <li>• Ôn tập trước kỳ thi</li>
                    <li>• Tăng vốn từ vựng</li>
                    <li>• Phát triển kỹ năng ngôn ngữ</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                  <h4 className="font-semibold text-green-900 mb-2">💼 Cho người đi làm</h4>
                  <ul className="space-y-1 text-sm text-green-800">
                    <li>• Học ngoại ngữ cho công việc</li>
                    <li>• Tận dụng thời gian rảnh</li>
                    <li>• Nâng cao kỹ năng giao tiếp</li>
                    <li>• Phát triển sự nghiệp</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Liên hệ</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">👨‍💻 Developer</h3>
              <p className="text-lg text-gray-700">
                <strong>Ngọc Sáng</strong><br />
                Full-stack Developer<br />
                Android Developer<br />
                Chuyên phát triển ứng dụng web và mobile
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">📞 Kết nối</h3>
              <div className="space-y-3">
                <a
                  href="https://web.facebook.com/ngoc.sang2211"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 group"
                >
                  <Facebook className="h-5 w-5 text-blue-600 group-hover:text-blue-700" />
                  <span className="text-blue-600 group-hover:text-blue-700 font-medium">
                    Facebook: Ngọc Sáng
                  </span>
                </a>
                
                <a
                  href="https://www.instagram.com/ng.sang02/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-3 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors duration-200 group"
                >
                  <Instagram className="h-5 w-5 text-pink-600 group-hover:text-pink-700" />
                  <span className="text-pink-600 group-hover:text-pink-700 font-medium">
                    Instagram: @ng.sang02
                  </span>
                </a>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-600 font-medium">
                    Email: ngocsang.dev@gmail.com
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-gray-600 mb-2">
                © 2025 Flashcard App. Được phát triển với ❤️ bởi Ngọc Sáng
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Phiên bản 1.0.0 - Cập nhật lần cuối: Tháng 7/2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage; 