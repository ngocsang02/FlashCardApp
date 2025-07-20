import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, Folder, ChevronRight, ChevronDown, CheckCircle, ArrowRight, BookOpen } from 'lucide-react';

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

  // Fetch languages
  useEffect(() => {
    fetchLanguages();
  }, []);

  // Fetch topics when language changes
  useEffect(() => {
    if (selectedLanguage) {
      fetchTopics(selectedLanguage);
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

  const fetchLanguages = async () => {
    try {
      const response = await fetch('/api/languages');
      const data = await response.json();
      setLanguages(data);
    } catch (error) {
      console.error('Error fetching languages:', error);
    }
  };

  const fetchTopics = async (language) => {
    try {
      const response = await fetch(`/api/topics/${encodeURIComponent(language)}`);
      const data = await response.json();
      setTopics(data);
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const fetchVocabularies = async () => {
    if (!selectedLanguage || !selectedTopic) return;
    
    setLoading(true);
    try {
      // Lấy từ localStorage như Quiz component
      const cached = localStorage.getItem('vocabularies');
      if (cached) {
        try {
          const arr = JSON.parse(cached);
          const filtered = arr.filter(v => 
            v.language === selectedLanguage && 
            (selectedTopic === 'all' || v.topic === selectedTopic)
          );
          setVocabularies(filtered);
          setCurrentIndex(0);
          setIsLearning(true);
        } catch (error) {
          console.error('Error parsing cached vocabularies:', error);
          // Fallback to API
          const response = await fetch(`/api/vocabulary?language=${encodeURIComponent(selectedLanguage)}&topic=${encodeURIComponent(selectedTopic)}`);
          const data = await response.json();
          setVocabularies(data);
          setCurrentIndex(0);
          setIsLearning(true);
        }
      } else {
        // Fallback to API if no cache
        const response = await fetch(`/api/vocabulary?language=${encodeURIComponent(selectedLanguage)}&topic=${encodeURIComponent(selectedTopic)}`);
        const data = await response.json();
        setVocabularies(data);
        setCurrentIndex(0);
        setIsLearning(true);
      }
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
            onClick={resetLearning}
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
                  {selectedLanguage} - {selectedTopic}
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
              <div className="relative">
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <span className={selectedLanguage ? 'text-gray-900' : 'text-gray-500'}>
                    {selectedLanguage || 'Chọn ngôn ngữ'}
                  </span>
                  {showLanguageDropdown ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                
                {showLanguageDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {languages.map((language) => (
                      <button
                        key={language}
                        onClick={() => {
                          setSelectedLanguage(language);
                          setShowLanguageDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100"
                      >
                        {language}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Topic Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Folder className="h-4 w-4 inline mr-2" />
                Chủ đề
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowTopicDropdown(!showTopicDropdown)}
                  disabled={!selectedLanguage}
                  className={`w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    selectedLanguage
                      ? 'bg-white hover:bg-gray-50'
                      : 'bg-gray-100 cursor-not-allowed'
                  }`}
                >
                  <span className={selectedTopic ? 'text-gray-900' : 'text-gray-500'}>
                    {selectedTopic || (selectedLanguage ? 'Chọn chủ đề' : 'Không có chủ đề')}
                  </span>
                  {showTopicDropdown ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                
                {showTopicDropdown && selectedLanguage && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {topics.length > 0 ? (
                      topics.map((topic) => (
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
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500">Không có chủ đề nào</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Start Button */}
            <div className="pt-4">
              <button
                onClick={fetchVocabularies}
                disabled={!selectedLanguage || !selectedTopic || loading}
                className={`w-full flex items-center justify-center px-6 py-3 rounded-md font-medium transition-colors ${
                  selectedLanguage && selectedTopic && !loading
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VocabularyLearning; 