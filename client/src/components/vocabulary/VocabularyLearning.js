import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, Folder, ChevronRight, ChevronDown, CheckCircle, ArrowRight, BookOpen, AlertTriangle } from 'lucide-react';
import config, { debugLog, errorLog, isDevelopment } from '../../config/environment';

function VocabularyLearning() {
  const navigate = useNavigate();
  const [languages, setLanguages] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [vocabularies, setVocabularies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLearning, setIsLearning] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showTopicDropdown, setShowTopicDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [error, setError] = useState('');
  const [languagesLoading, setLanguagesLoading] = useState(true);
  const [topicsLoading, setTopicsLoading] = useState(false);
  
  // Thêm state cho số từ mới để học
  const [vocabCount, setVocabCount] = useState(0);
  
  // Hàm chuyển đổi mã ngôn ngữ sang tên tiếng Việt
  const getLanguageName = (code) => {
    const languages = {
      'english': 'Tiếng Anh',
      'korean': 'Tiếng Hàn',
      'japanese': 'Tiếng Nhật',
      'chinese': 'Tiếng Trung'
    };
    // Nếu code không có trong danh sách cố định, trả về chính nó (ngôn ngữ tùy chỉnh)
    return languages[code] || code;
  };
  const [filteredVocabCount, setFilteredVocabCount] = useState(0);
  const [wordCountMode, setWordCountMode] = useState('preset'); // 'preset' | 'custom' | 'all'
  const [customWordCount, setCustomWordCount] = useState('');
  const [wordCount, setWordCount] = useState(10);
  const [wordCountError, setWordCountError] = useState('');

  // Fetch languages
  useEffect(() => {
    fetchLanguages();
  }, []);

  // Fetch topics when language changes
  useEffect(() => {
    if (selectedLanguage) {
      fetchTopics(selectedLanguage);
      setSelectedTopic('all'); // Mặc định chọn "Tất cả chủ đề"
    } else {
      setTopics([]);
      setSelectedTopic('');
    }
  }, [selectedLanguage]);

  // Reset image state when vocabulary changes
  useEffect(() => {
    if (currentVocabulary) {
      setImageLoading(true);
      setImageError(false);
    }
  }, [currentIndex, vocabularies]);

  // Lấy số lượng từ vựng từ API hoặc localStorage
  useEffect(() => {
    const fetchVocabCount = async () => {
      try {
        debugLog('Fetching vocabularies count from API...');
        const response = await fetch(`${config.apiUrl}/api/vocabulary`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setVocabCount(data.length);
        // Cập nhật localStorage để cache
        localStorage.setItem(config.storageKeys.vocabularies, JSON.stringify(data));
        debugLog('Vocabularies count updated:', data.length);
      } catch (error) {
        errorLog('Error fetching vocabularies for count:', error);
        // Fallback to localStorage
        const cached = localStorage.getItem(config.storageKeys.vocabularies);
        if (cached) {
          try {
            const arr = JSON.parse(cached);
            setVocabCount(Array.isArray(arr) ? arr.length : 0);
            debugLog('Using cached vocabularies count:', arr.length);
          } catch {
            setVocabCount(0);
          }
        } else {
          setVocabCount(0);
        }
      }
    };
    
    fetchVocabCount();
  }, []);

  // Hàm filter vocabularies theo ngôn ngữ/chủ đề
  useEffect(() => {
    if (!selectedLanguage) {
      setFilteredVocabCount(0);
      return;
    }
    
    const fetchFilteredCount = async () => {
      try {
        // Khi selectedTopic là 'all', không gửi topic parameter để lấy tất cả chủ đề
        const apiUrl = selectedTopic === 'all' 
          ? `${config.apiUrl}/api/vocabulary?language=${encodeURIComponent(selectedLanguage)}`
          : `${config.apiUrl}/api/vocabulary?language=${encodeURIComponent(selectedLanguage)}&topic=${encodeURIComponent(selectedTopic)}`;
        
        debugLog('Fetching filtered vocabularies:', apiUrl);
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setFilteredVocabCount(data.length);
        debugLog('Filtered vocabularies count:', data.length);
      } catch (error) {
        errorLog('Error fetching filtered vocabularies:', error);
        // Fallback to localStorage
        const cached = localStorage.getItem(config.storageKeys.vocabularies);
        if (cached) {
          try {
            const arr = JSON.parse(cached);
            const filtered = arr.filter(v => v.language === selectedLanguage && (selectedTopic === 'all' || v.topic === selectedTopic));
            setFilteredVocabCount(filtered.length);
            debugLog('Using cached filtered vocabularies count:', filtered.length);
          } catch {
            setFilteredVocabCount(0);
          }
        } else {
          setFilteredVocabCount(0);
        }
      }
    };
    
    fetchFilteredCount();
  }, [selectedLanguage, selectedTopic]);

  // Đóng dropdown khi click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const languageDropdown = document.querySelector('[data-dropdown="language"]');
      const topicDropdown = document.querySelector('[data-dropdown="topic"]');
      
      if (showLanguageDropdown && languageDropdown && !languageDropdown.contains(event.target)) {
        setShowLanguageDropdown(false);
      }
      
      if (showTopicDropdown && topicDropdown && !topicDropdown.contains(event.target)) {
        setShowTopicDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLanguageDropdown, showTopicDropdown]);

  const fetchLanguages = async () => {
    setLanguagesLoading(true);
    setError('');
    try {
      debugLog('Fetching languages from API...');
      const response = await fetch(`${config.apiUrl}/api/languages`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setLanguages(data);
      debugLog('Languages loaded:', data);
    } catch (error) {
      errorLog('Error fetching languages:', error);
      setError('Không thể tải danh sách ngôn ngữ. Vui lòng thử lại.');
    } finally {
      setLanguagesLoading(false);
    }
  };

  const fetchTopics = async (language) => {
    setTopicsLoading(true);
    try {
      debugLog('Fetching topics for language:', language);
      const response = await fetch(`${config.apiUrl}/api/topics/${encodeURIComponent(language)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTopics(data);
      debugLog('Topics loaded for', language, ':', data);
    } catch (error) {
      errorLog('Error fetching topics:', error);
      setTopics([]);
    } finally {
      setTopicsLoading(false);
    }
  };

  const fetchVocabularies = async () => {
    if (!selectedLanguage || !selectedTopic) return;
    
    setLoading(true);
    try {
      // Ưu tiên lấy từ API trước, sau đó fallback về localStorage
      let vocabularies = [];
      
      try {
        // Lấy từ API với filter theo ngôn ngữ và chủ đề
        const apiUrl = selectedTopic === 'all' 
          ? `${config.apiUrl}/api/vocabulary?language=${encodeURIComponent(selectedLanguage)}`
          : `${config.apiUrl}/api/vocabulary?language=${encodeURIComponent(selectedLanguage)}&topic=${encodeURIComponent(selectedTopic)}`;
        
        debugLog('Fetching vocabularies for learning:', apiUrl);
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        vocabularies = data;
        debugLog('Vocabularies loaded for learning:', vocabularies.length);
        
        // Cập nhật localStorage để cache
        const allVocabularies = localStorage.getItem(config.storageKeys.vocabularies);
        if (allVocabularies) {
          try {
            const cached = JSON.parse(allVocabularies);
            const updated = cached.filter(v => 
              !(v.language === selectedLanguage && (selectedTopic === 'all' || v.topic === selectedTopic))
            );
            localStorage.setItem(config.storageKeys.vocabularies, JSON.stringify([...updated, ...vocabularies]));
            debugLog('Updated localStorage cache');
          } catch (error) {
            errorLog('Error updating localStorage:', error);
          }
        }
      } catch (apiError) {
        errorLog('Error fetching from API, falling back to localStorage:', apiError);
        
        // Fallback to localStorage
        const cached = localStorage.getItem(config.storageKeys.vocabularies);
        if (cached) {
          try {
            const arr = JSON.parse(cached);
            vocabularies = arr.filter(v => 
              v.language === selectedLanguage && 
              (selectedTopic === 'all' || v.topic === selectedTopic)
            );
            debugLog('Using cached vocabularies for learning:', vocabularies.length);
          } catch (error) {
            errorLog('Error parsing cached vocabularies:', error);
            vocabularies = [];
          }
        }
      }
      
      // Giới hạn số từ theo lựa chọn của người dùng
      let limitedVocabularies = vocabularies;
      if (wordCountMode === 'preset' || wordCountMode === 'custom') {
        limitedVocabularies = vocabularies.slice(0, wordCount);
      }
      
      setVocabularies(limitedVocabularies);
      setCurrentIndex(0);
      setIsLearning(true);
    } catch (error) {
      console.error('Error fetching vocabularies:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextVocabulary = () => {
    if (currentIndex < vocabularies.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const previousVocabulary = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const resetLearning = () => {
    setIsLearning(false);
    setCurrentIndex(0);
    setVocabularies([]);
  };

  const handleExitLearning = () => {
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    setShowExitConfirm(false);
    resetLearning();
  };

  const cancelExit = () => {
    setShowExitConfirm(false);
  };

  // Helper function to get image URL
  const getImageUrl = (vocabulary) => {
    const imageUrl = vocabulary.image || vocabulary.imageUrl;
    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
      return null;
    }
    return imageUrl.trim();
  };

  // Helper function to check if URL is valid
  const isValidImageUrl = (url) => {
    try {
      new URL(url);
      return url.startsWith('http');
    } catch {
      return false;
    }
  };

  const currentVocabulary = vocabularies[currentIndex];

  // Debug: Log current vocabulary data
  if (currentVocabulary) {
    console.log('Current vocabulary data:', currentVocabulary);
  }

  if (isLearning && currentVocabulary) {
    return (
      <div className="min-h-screen">
        {/* Back button - original position */}
        <div className="px-4 sm:px-6 lg:px-8 pt-4">
          <button
            onClick={handleExitLearning}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </button>
        </div>

        {/* Header */}
        <div className="mt-4">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-lg sm:text-xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text">
                  Học từ vựng
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  {getLanguageName(selectedLanguage)} - {selectedTopic === 'all' ? 'Tất cả chủ đề' : selectedTopic} ({vocabularies.length} từ)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Status Bar */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 p-3 sm:p-4">
              <div className="flex items-center text-green-700">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="text-sm sm:text-base font-medium">Đang học từ vựng</span>
              </div>
            </div>

            {/* Vocabulary Content */}
            <div className="grid grid-cols-2 gap-0">
              {/* Text Content */}
              <div className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Từ vựng:</label>
                    <div className="text-lg sm:text-xl font-bold text-blue-600">
                      {currentVocabulary.word}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nghĩa:</label>
                    <div className="text-base sm:text-lg text-gray-900">
                      {currentVocabulary.meaning || currentVocabulary.definition || 'Không có nghĩa'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chủ đề:</label>
                    <div className="text-sm sm:text-base text-gray-600">
                      {currentVocabulary.topic}
                    </div>
                  </div>
                </div>
              </div>

              {/* Image - Always on the right */}
              <div className="p-4 sm:p-6 bg-gray-50 flex items-center justify-center">
                {(() => {
                  const imageUrl = getImageUrl(currentVocabulary);
                  
                  if (!imageUrl || !isValidImageUrl(imageUrl)) {
                    return (
                      <div className="w-full h-32 sm:h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                        <div className="text-gray-500 text-center">
                          <div className="text-2xl sm:text-3xl mb-2">📷</div>
                          <div className="text-xs sm:text-sm">Không có hình ảnh</div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="w-full h-32 sm:h-48 relative">
                      {imageLoading && (
                        <div className="absolute inset-0 bg-gray-200 rounded-lg flex items-center justify-center z-10">
                          <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                      
                      <img
                        key={`${currentVocabulary.word}-${currentIndex}`}
                        src={imageUrl}
                        alt={currentVocabulary.word}
                        className={`w-full h-full object-cover rounded-lg shadow-md transition-opacity duration-300 ${
                          imageLoading ? 'opacity-0' : 'opacity-100'
                        }`}
                        onLoad={() => {
                          setImageLoading(false);
                          setImageError(false);
                          console.log('Image loaded successfully:', imageUrl);
                        }}
                        onError={(e) => {
                          console.error('Image load error:', imageUrl);
                          setImageLoading(false);
                          setImageError(true);
                          e.target.style.display = 'none';
                        }}
                      />
                      
                      {imageError && !imageLoading && (
                        <div className="absolute inset-0 bg-gray-200 rounded-lg flex items-center justify-center">
                          <div className="text-gray-500 text-center px-2">
                            <div className="text-2xl sm:text-3xl mb-2">❌</div>
                            <div className="text-xs sm:text-sm">Hình ảnh không tải được</div>
                            <div className="text-xs mt-1 break-all max-w-full">
                              {imageUrl}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Navigation */}
            <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
              <button
                onClick={previousVocabulary}
                disabled={currentIndex === 0}
                className={`flex items-center px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                  currentIndex === 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
              >
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Từ trước</span>
                <span className="sm:hidden">Trước</span>
              </button>

              {/* Progress indicator with gradient */}
              <div className="text-center">
                <div className="text-base sm:text-lg font-bold text-transparent bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text">
                  {currentIndex + 1} / {vocabularies.length}
                </div>
              </div>

              <button
                onClick={nextVocabulary}
                disabled={currentIndex === vocabularies.length - 1}
                className={`flex items-center px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                  currentIndex === vocabularies.length - 1
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
              >
                <span className="hidden sm:inline">Từ tiếp theo</span>
                <span className="sm:hidden">Tiếp</span>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
              </button>
            </div>
          </div>
        </div>

        {/* Exit Confirmation Popup */}
        {showExitConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-yellow-500 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Xác nhận thoát
                  </h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Bạn có chắc chắn muốn thoát khỏi quá trình học từ vựng? Tiến độ hiện tại sẽ không được lưu.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={cancelExit}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={confirmExit}
                    className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md font-medium transition-colors"
                  >
                    Thoát
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header với nút quay lại */}
      <div className="mb-2">
        <Link
          to="/vocabulary"
          className="inline-flex items-center text-gray-500 hover:text-primary-600 transition-colors text-base"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Quay lại
        </Link>
      </div>

      <div className="mb-10 flex flex-col items-center justify-center select-none">
        <span className="mb-2">
          <BookOpen className="h-14 w-14 drop-shadow-lg text-transparent bg-gradient-to-tr from-blue-400 via-green-400 to-purple-500 bg-clip-text" />
        </span>
        <h1 className="text-5xl font-extrabold text-transparent bg-gradient-to-tr from-blue-600 via-green-600 to-purple-600 bg-clip-text drop-shadow-lg tracking-tight mb-2 leading-tight overflow-visible whitespace-pre-line p-2">
          Học từ vựng
        </h1>
        <span className="text-base text-gray-500 font-medium mb-4">Chọn ngôn ngữ và chủ đề để bắt đầu học</span>
        <div className="w-24 h-1 rounded-full bg-gradient-to-r from-blue-400 via-green-400 to-purple-400 mb-2" />
        {selectedLanguage && (selectedTopic === 'all' || selectedTopic) && filteredVocabCount > 0 && (
          <div className="text-sm text-blue-600 font-medium">
            Có {filteredVocabCount} từ vựng có sẵn
          </div>
        )}
      </div>

      {/* Selection Form */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="space-y-6">
            {/* Language Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Globe className="h-4 w-4 inline mr-2" />
                Ngôn ngữ
              </label>
              <div className="relative" data-dropdown="language">
                <button
                  onClick={() => {
                    setShowLanguageDropdown(!showLanguageDropdown);
                    // Đóng dropdown khác khi mở dropdown này
                    if (!showLanguageDropdown) {
                      setShowTopicDropdown(false);
                    }
                  }}
                  disabled={languagesLoading}
                  className={`w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    languagesLoading 
                      ? 'bg-gray-100 cursor-not-allowed' 
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <span className={selectedLanguage ? 'text-gray-900' : 'text-gray-500'}>
                    {languagesLoading ? 'Đang tải...' : (selectedLanguage ? getLanguageName(selectedLanguage) : 'Chọn ngôn ngữ')}
                  </span>
                  {languagesLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  ) : showLanguageDropdown ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                
                {showLanguageDropdown && !languagesLoading && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-xl max-h-60 overflow-auto">
                    {languages.length > 0 ? (
                      languages.map((language) => (
                        <button
                          key={language}
                          onClick={() => {
                            setSelectedLanguage(language);
                            setShowLanguageDropdown(false);
                            setShowTopicDropdown(false); // Đóng topic dropdown khi chọn ngôn ngữ mới
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100"
                        >
                          {getLanguageName(language)}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500">Không có ngôn ngữ nào</div>
                    )}
                  </div>
                )}
              </div>
              {error && (
                <div className="text-red-500 text-sm mt-1">{error}</div>
              )}
            </div>

            {/* Topic Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Folder className="h-4 w-4 inline mr-2" />
                Chủ đề
              </label>
              <div className="relative" data-dropdown="topic">
                <button
                  onClick={() => {
                    setShowTopicDropdown(!showTopicDropdown);
                    // Đóng dropdown khác khi mở dropdown này
                    if (!showTopicDropdown) {
                      setShowLanguageDropdown(false);
                    }
                  }}
                  disabled={!selectedLanguage || topicsLoading}
                  className={`w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    selectedLanguage && !topicsLoading
                      ? 'bg-white hover:bg-gray-50'
                      : 'bg-gray-100 cursor-not-allowed'
                  }`}
                >
                  <span className={selectedTopic ? 'text-gray-900' : 'text-gray-500'}>
                    {topicsLoading ? 'Đang tải...' : (selectedTopic === 'all' ? 'Tất cả chủ đề' : selectedTopic || (selectedLanguage ? 'Chọn chủ đề' : 'Không có chủ đề'))}
                  </span>
                  {topicsLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  ) : showTopicDropdown ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                
                {showTopicDropdown && selectedLanguage && !topicsLoading && (
                  <div className="absolute z-30 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-xl max-h-60 overflow-auto">
                    {topics.length > 0 ? (
                      <>
                        <button
                          onClick={() => {
                            setSelectedTopic('all');
                            setShowTopicDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 font-medium"
                        >
                          Tất cả chủ đề
                        </button>
                        {topics.map((topic) => (
                          <button
                            key={topic}
                            onClick={() => {
                              setSelectedTopic(topic);
                              setShowTopicDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100"
                          >
                            {topic}
                          </button>
                        ))}
                      </>
                    ) : (
                      <div className="px-4 py-2 text-gray-500">Không có chủ đề nào</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Word Count Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <BookOpen className="h-4 w-4 inline mr-2" />
                Số từ mới để học
              </label>
              {wordCountMode === 'custom' ? (
                <>
                  <input
                    type="number"
                    value={customWordCount}
                    onChange={e => {
                      const val = e.target.value;
                      setCustomWordCount(val);
                      if (val === '') {
                        setWordCountError('Vui lòng nhập số từ');
                        setWordCount('');
                        return;
                      }
                      const num = Number(val);
                      if (isNaN(num) || num < 1) {
                        setWordCountError('Số từ phải lớn hơn 0');
                        setWordCount('');
                      } else if (num > filteredVocabCount) {
                        setWordCountError(`Tối đa ${filteredVocabCount} từ`);
                        setWordCount('');
                      } else {
                        setWordCountError('');
                        setWordCount(num);
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Nhập số từ (1-${filteredVocabCount})`}
                    disabled={!selectedLanguage || filteredVocabCount === 0}
                  />
                  {wordCountError && (
                    <div className="text-red-500 text-sm mt-1">{wordCountError}</div>
                  )}
                </>
              ) : (
                <select
                  value={wordCountMode === 'custom' ? 'custom' : (wordCountMode === 'all' ? 'all' : wordCount)}
                  onChange={e => {
                    if (e.target.value === 'custom') {
                      setWordCountMode('custom');
                      setCustomWordCount('');
                      setWordCount('');
                      setWordCountError('');
                    } else if (e.target.value === 'all') {
                      setWordCountMode('all');
                      setWordCount(filteredVocabCount);
                      setWordCountError('');
                    } else {
                      setWordCountMode('preset');
                      setWordCount(Number(e.target.value));
                      setWordCountError('');
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  disabled={!selectedLanguage || filteredVocabCount === 0}
                >
                  {!selectedLanguage || filteredVocabCount === 0 ? (
                    <option value={0}>0 từ</option>
                  ) : (
                    <>
                      {filteredVocabCount >= 5 && <option value={5}>5 từ</option>}
                      {filteredVocabCount >= 10 && <option value={10}>10 từ</option>}
                      {filteredVocabCount >= 20 && <option value={20}>20 từ</option>}
                      {filteredVocabCount >= 30 && <option value={30}>30 từ</option>}
                      {filteredVocabCount >= 50 && <option value={50}>50 từ</option>}
                      {filteredVocabCount >= 100 && <option value={100}>100 từ</option>}
                      {filteredVocabCount >= 200 && <option value={200}>200 từ</option>}
                      {filteredVocabCount >= 300 && <option value={300}>300 từ</option>}
                      {filteredVocabCount >= 500 && <option value={500}>500 từ</option>}
                      {filteredVocabCount >= 1000 && <option value={1000}>1000 từ</option>}
                      <option value="all">Toàn bộ ({filteredVocabCount} từ)</option>
                      <option value="custom">Khác...</option>
                    </>
                  )}
                </select>
              )}
            </div>

            {/* Start Button */}
            <div className="pt-4">
              <button
                onClick={fetchVocabularies}
                disabled={!selectedLanguage || (selectedTopic !== 'all' && !selectedTopic) || loading || filteredVocabCount === 0 || (wordCountMode === 'custom' && wordCountError)}
                className={`w-full flex items-center justify-center px-6 py-3 rounded-md font-medium transition-colors ${
                  selectedLanguage && (selectedTopic === 'all' || selectedTopic) && !loading && filteredVocabCount > 0 && !(wordCountMode === 'custom' && wordCountError)
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang tải...
                  </div>
                ) : (
                  <>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Bắt đầu học
                  </>
                )}
              </button>
              {filteredVocabCount === 0 && selectedLanguage && (selectedTopic === 'all' || selectedTopic) && (
                <div className="text-red-500 text-sm mt-2 text-center">
                  Không có từ vựng nào cho ngôn ngữ và chủ đề đã chọn.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VocabularyLearning; 