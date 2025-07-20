import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Play, ArrowLeft, Plus } from 'lucide-react';

function VocabularySelection() {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header với nút quay lại */}
      <div className="mb-2">
        <Link
          to="/"
          className="inline-flex items-center text-gray-500 hover:text-primary-600 transition-colors text-base"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Về trang chủ
        </Link>
      </div>

      <div className="mb-10 flex flex-col items-center justify-center select-none">
        <span className="mb-2">
          <BookOpen className="h-14 w-14 drop-shadow-lg text-transparent bg-gradient-to-tr from-blue-400 via-green-400 to-purple-500 bg-clip-text" />
        </span>
        <h1 className="text-5xl font-extrabold text-transparent bg-gradient-to-tr from-blue-600 via-green-600 to-purple-600 bg-clip-text drop-shadow-lg tracking-tight mb-2 leading-tight overflow-visible whitespace-pre-line p-2">
          Từ vựng
        </h1>
        <span className="text-base text-gray-500 font-medium mb-4">Chọn chế độ học tập phù hợp với bạn</span>
        <div className="w-24 h-1 rounded-full bg-gradient-to-r from-blue-400 via-green-400 to-purple-400 mb-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        {/* Học từ vựng */}
        <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-lg mb-6 mx-auto">
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
            Học từ vựng
          </h3>
          <p className="text-gray-600 mb-6 text-center">
            Xem từ vựng lần lượt với hình ảnh minh họa để ghi nhớ từ mới một cách hiệu quả.
          </p>
          <div className="flex justify-center">
            <Link
              to="/vocabulary/learn"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Bắt đầu học
            </Link>
          </div>
        </div>

        {/* Bài kiểm tra */}
        <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-lg mb-6 mx-auto">
            <Play className="h-8 w-8 text-green-700" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
            Bài kiểm tra
          </h3>
          <p className="text-gray-600 mb-6 text-center">
            Luyện tập với các bài kiểm tra đa dạng để củng cố kiến thức đã học.
          </p>
          <div className="flex justify-center">
            <Link
              to="/quiz"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
            >
              Làm bài kiểm tra
            </Link>
          </div>
        </div>

        {/* Quản lý từ vựng */}
        <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-lg mb-6 mx-auto">
            <Plus className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
            Quản lý từ vựng
          </h3>
          <p className="text-gray-600 mb-6 text-center">
            Thêm, sửa, xóa từ vựng và import từ file CSV theo chủ đề và ngôn ngữ.
          </p>
          <div className="flex justify-center">
            <Link
              to="/vocabulary/manage"
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium"
            >
              Quản lý
            </Link>
          </div>
        </div>
      </div>

      {/* Thông tin bổ sung */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Lưu ý:</h4>
        <ul className="space-y-2 text-gray-600">
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span><strong>Học từ vựng:</strong> Phù hợp cho việc làm quen với từ mới và ghi nhớ nghĩa</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">•</span>
            <span><strong>Bài kiểm tra:</strong> Phù hợp cho việc ôn tập và kiểm tra kiến thức đã học</span>
          </li>
          <li className="flex items-start">
            <span className="text-purple-500 mr-2">•</span>
            <span><strong>Quản lý từ vựng:</strong> Thêm, sửa, xóa từ vựng và import từ file CSV</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default VocabularySelection; 