import React, { useState, useEffect } from 'react';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import QuestionTypeLineChart from './QuestionTypeLineChart';
import QuestionTypeBarChart from './QuestionTypeBarChart';
import LanguageLineChart from './LanguageLineChart';
import LanguageBarChart from './LanguageBarChart';
import { Listbox } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

function StatisticsPage() {
  const navigate = useNavigate();
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailableLanguages();
  }, []);

  const fetchAvailableLanguages = async () => {
    try {
      const response = await axios.get('/api/vocabulary/languages-with-topic');
      setAvailableLanguages(response.data);
      if (response.data.length > 0) {
        setSelectedLanguage(response.data[0]);
      } else {
        setSelectedLanguage('');
      }
    } catch (error) {
      console.error('Error fetching languages:', error);
      setAvailableLanguages([]);
      setSelectedLanguage('');
    } finally {
      setLoading(false);
    }
  };

  const getLanguageName = (code) => {
    const languages = {
      'english': 'Tiếng Anh',
      'korean': 'Tiếng Hàn',
      'japanese': 'Tiếng Nhật',
      'chinese': 'Tiếng Trung'
    };
    return languages[code] || code;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Nếu không có ngôn ngữ nào thì hiển thị thông báo
  if (availableLanguages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <BarChart3 className="h-14 w-14 mb-4 text-transparent bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400 bg-clip-text" />
        <h1 className="text-3xl font-bold mb-2 text-gray-700">Chưa có dữ liệu thống kê</h1>
        <p className="text-gray-500 mb-6">Hãy tạo chủ đề cho ít nhất một ngôn ngữ để xem thống kê học tập!</p>
        <button
          onClick={() => navigate('/vocabulary')}
          className="px-6 py-2 rounded-lg bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400 text-white font-semibold shadow hover:brightness-110 transition-all"
        >
          Thêm chủ đề
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header + Filter */}
        <div className="mb-8 flex flex-col items-center justify-center select-none">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-500 hover:text-primary-600 transition-colors text-sm mb-2 self-start"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Về trang chủ
          </button>
          <span className="mb-2">
            <BarChart3 className="h-14 w-14 drop-shadow-lg text-transparent bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400 bg-clip-text" />
          </span>
          <h1 className="text-5xl font-extrabold text-transparent bg-gradient-to-tr from-purple-600 via-pink-600 to-orange-500 bg-clip-text drop-shadow-lg tracking-tight mb-2 leading-tight overflow-visible whitespace-pre-line p-2">
            Thống kê học tập
          </h1>
          <span className="text-base text-gray-500 font-medium mb-4">Theo dõi tiến độ học tập của bạn</span>
          <div className="w-24 h-1 rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-orange-300 mb-2" />
          <div className="flex items-center gap-2 justify-center mt-4">
            <span className="text-base font-medium text-gray-700">Chọn ngôn ngữ để xem thống kê:</span>
            <div className="relative flex items-center justify-center">
              <Listbox value={selectedLanguage} onChange={setSelectedLanguage}>
                <div className="relative w-36">
                  <Listbox.Button className="w-full cursor-pointer rounded-lg py-2 pl-5 pr-10 text-base font-semibold text-gray-900 shadow focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all bg-white/80 backdrop-blur border border-gray-200 hover:bg-white text-center">
                    {getLanguageName(selectedLanguage) || 'Chọn ngôn ngữ'}
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <ChevronDownIcon className="h-5 w-5 text-transparent bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400 bg-clip-text" aria-hidden="true" />
                    </span>
                  </Listbox.Button>
                  <Listbox.Options className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-lg bg-white/90 backdrop-blur py-1 text-base shadow-xl ring-1 ring-gray-200 focus:outline-none text-center">
                    {availableLanguages.map((lang) => (
                      <Listbox.Option
                        key={lang}
                        value={lang}
                        className={({ active, selected }) =>
                          `cursor-pointer select-none py-2 px-5 transition-all rounded-md mx-1 text-center ${
                            active ? 'bg-purple-50 text-purple-700' : 'text-gray-900'
                          } ${selected ? 'text-pink-600 font-semibold' : ''}`
                        }
                      >
                        {getLanguageName(lang)}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>
            </div>
          </div>
        </div>

        {/* Only show 2 charts for selected language */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Tỷ lệ đúng theo loại câu hỏi - {getLanguageName(selectedLanguage)} (ngày)
            </h2>
            <div className="h-80">
              <LanguageLineChart selectedLanguage={selectedLanguage} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Tỷ lệ đúng theo loại câu hỏi - {getLanguageName(selectedLanguage)} (giờ)
            </h2>
            <div className="h-80">
              <LanguageBarChart selectedLanguage={selectedLanguage} />
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tổng số bài kiểm tra</h3>
            <p className="text-3xl font-bold text-primary-600">24</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tỷ lệ đúng trung bình</h3>
            <p className="text-3xl font-bold text-green-600">78%</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Từ vựng đã học</h3>
            <p className="text-3xl font-bold text-blue-600">156</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatisticsPage; 