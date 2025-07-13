import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Plus, Play, TrendingUp } from 'lucide-react';

function HomePage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col items-center justify-center select-none">
        <span className="mb-2">
          <BookOpen className="h-14 w-14 drop-shadow-lg text-transparent bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 bg-clip-text" />
        </span>
        <h1 className="text-5xl font-extrabold text-transparent bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-500 bg-clip-text drop-shadow-lg tracking-tight mb-2 leading-tight overflow-visible whitespace-pre-line p-2">
          Chào mừng đến với Flashcard App
        </h1>
        <span className="text-base text-gray-500 font-medium mb-4">Ứng dụng học từ vựng hiệu quả, hiện đại và dễ sử dụng</span>
        <div className="w-24 h-1 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4 mx-auto">
            <Plus className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
            Quản lý từ vựng
          </h3>
          <p className="text-gray-600 mb-4">
            Thêm từ vựng mới thủ công hoặc import từ file CSV theo chủ đề và ngôn ngữ.
          </p>
          <div className="flex justify-center">
            <Link
              to="/vocabulary"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Bắt đầu
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4 mx-auto">
            <Play className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
            Bài kiểm tra
          </h3>
          <p className="text-gray-600 mb-4">
            Luyện tập với các bài kiểm tra đa dạng: nhìn hình chọn từ hoặc nhìn từ chọn hình.
          </p>
          <div className="flex justify-center">
            <Link
              to="/quiz"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Làm bài kiểm tra
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4 mx-auto">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
            Theo dõi tiến độ
          </h3>
          <p className="text-gray-600 mb-4">
            Xem thống kê học tập và theo dõi tiến độ học từ vựng của bạn.
          </p>
          <div className="flex justify-center">
            <Link
              to="/statistics"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Xem thống kê
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-12 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Hướng dẫn sử dụng
        </h2>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-primary-600 font-semibold">1</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Thêm từ vựng</h3>
              <p className="text-gray-600">
                Vào trang "Quản lý từ vựng" để thêm từ mới hoặc import từ file CSV.
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-primary-600 font-semibold">2</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Làm bài kiểm tra</h3>
              <p className="text-gray-600">
                Vào trang "Bài kiểm tra" để luyện tập với các từ đã thêm.
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-primary-600 font-semibold">3</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Lặp lại và ghi nhớ</h3>
              <p className="text-gray-600">
                Làm bài kiểm tra thường xuyên để củng cố kiến thức và ghi nhớ từ vựng.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage; 