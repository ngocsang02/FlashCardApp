import React, { useState, useEffect, useRef } from 'react';
import axios from '../../axiosConfig';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Upload, Trash2, Eye, EyeOff, List, ChevronRight, ChevronDown, Globe, FolderOpen, FileText, ArrowLeft, BookOpen, MoreVertical, Edit, X } from 'lucide-react';
import DropdownMenu from '../util/DropdownMenu';
import config, { debugLog, errorLog } from '../../config/environment';

// Component dropdown tùy chỉnh cho ngôn ngữ
const LanguageDropdown = ({ value, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const languages = [
    { value: 'english', label: 'Tiếng Anh' },
    { value: 'korean', label: 'Tiếng Hàn' },
    { value: 'japanese', label: 'Tiếng Nhật' },
    { value: 'chinese', label: 'Tiếng Trung' },
    { value: 'other', label: 'Khác...' }
  ];
  
  const selectedLanguage = languages.find(lang => lang.value === value) || languages[0];
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-left flex items-center justify-between"
      >
        <span>{selectedLanguage.label}</span>
        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {languages.map((language) => (
            <button
              key={language.value}
              type="button"
              onClick={() => {
                onChange(language.value);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100 first:rounded-t-md last:rounded-b-md"
            >
              {language.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

function VocabularyManager() {
  const navigate = useNavigate();
  const location = useLocation();
  const [vocabularies, setVocabularies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    word: '',
    meaning: '',
    imageUrl: '',
    language: '',
    topic: ''
  });
  const [csvFile, setCsvFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [csvTopic, setCsvTopic] = useState('');
  const [csvLanguage, setCsvLanguage] = useState('');
  const [csvCustomLanguage, setCsvCustomLanguage] = useState('');
  const [showList, setShowList] = useState(false);
  const [expandedLanguages, setExpandedLanguages] = useState({});
  const [expandedTopics, setExpandedTopics] = useState({});
  const [showCustomLanguageInput, setShowCustomLanguageInput] = useState(false);
  const [showCustomLanguageInputCsv, setShowCustomLanguageInputCsv] = useState(false);
  const [showCustomTopicInput, setShowCustomTopicInput] = useState(false);
  const [selectedTopicOption, setSelectedTopicOption] = useState('existing');
  const [imageInputType, setImageInputType] = useState('url'); // 'url' or 'file'
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);
  // Thêm state cho modal preview ảnh
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState('');
  // Thêm biến lưu url ảnh upload gần nhất
  const [lastUploadedImageUrl, setLastUploadedImageUrl] = useState('');
  const [defaultLanguage, setDefaultLanguage] = useState('');
  const [showDefaultLanguageModal, setShowDefaultLanguageModal] = useState(false);

  // Khôi phục state khi quay lại
  useEffect(() => {
    if (location.state && location.state._restoreUI) {
      if (location.state.showList !== undefined) setShowList(location.state.showList);
      if (location.state.expandedLanguages) setExpandedLanguages(location.state.expandedLanguages);
      if (location.state.expandedTopics) setExpandedTopics(location.state.expandedTopics);
      // ... có thể bổ sung các state khác nếu cần ...
    }
  }, []);

  useEffect(() => {
    fetchVocabularies();
    fetchDefaultLanguage();
  }, []);

  // Hàm lấy vocabularies, luôn lấy mới từ server
  const fetchVocabularies = async () => {
    setLoading(true);
    try {
      debugLog('Fetching vocabularies from server...');
      const response = await axios.get('/api/vocabulary');
      setVocabularies(response.data);
      localStorage.setItem(config.storageKeys.vocabularies, JSON.stringify(response.data));
      debugLog('Vocabularies updated:', response.data.length);
    } catch (error) {
      errorLog('Error fetching vocabularies:', error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy ngôn ngữ default từ server
  const fetchDefaultLanguage = async () => {
    try {
      const response = await axios.get('/api/settings/default-language');
      setDefaultLanguage(response.data.defaultLanguage || '');
      
      // Set default language cho form và CSV khi khởi tạo
      if (response.data.defaultLanguage) {
        setFormData(prev => ({ ...prev, language: response.data.defaultLanguage }));
        setCsvLanguage(response.data.defaultLanguage);
      }
    } catch (error) {
      console.error('Error fetching default language:', error);
    }
  };

  // Hàm set ngôn ngữ default
  const setDefaultLanguageAPI = async (language) => {
    try {
      await axios.post('/api/settings/default-language', { defaultLanguage: language });
      setDefaultLanguage(language);
      
      // Cập nhật ngôn ngữ cho form và CSV nếu đang sử dụng ngôn ngữ mặc định cũ
      if (formData.language === defaultLanguage) {
        setFormData(prev => ({ ...prev, language: language }));
      }
      if (csvLanguage === defaultLanguage) {
        setCsvLanguage(language);
      }
      
      window.showToast('Đã cập nhật ngôn ngữ mặc định!', 'success');
    } catch (error) {
      console.error('Error setting default language:', error);
      window.showToast('Có lỗi xảy ra khi cập nhật ngôn ngữ mặc định', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation cho ngôn ngữ tùy chỉnh
    if (showCustomLanguageInput && !formData.language.trim()) {
      window.showToast('Vui lòng nhập tên ngôn ngữ tùy chỉnh', 'warning');
      return;
    }
    
    try {
      let imageUrl = formData.imageUrl;
      
      // Upload image if file is selected
      if (imageInputType === 'file' && imageFile) {
        imageUrl = await uploadImage(imageFile);
      }
      
      const submitData = {
        ...formData,
        imageUrl: imageUrl
      };
      
      await axios.post('/api/vocabulary', submitData);
      
      // Reset form
      setFormData({ word: '', meaning: '', imageUrl: '', language: defaultLanguage || 'english', topic: '' });
      setSelectedTopicOption('existing');
      setShowCustomTopicInput(false);
      setShowCustomLanguageInput(false);
      setImageInputType('url');
      setImageFile(null);
      setImagePreview('');
      setShowForm(false);
      // Gọi lại API và update cache
      const response = await axios.get('/api/vocabulary');
      setVocabularies(response.data);
      localStorage.setItem('vocabularies', JSON.stringify(response.data));
      window.showToast('Thêm từ vựng thành công!', 'success');
    } catch (error) {
      console.error('Error adding vocabulary:', error);
      window.showToast(error.message || 'Có lỗi xảy ra khi thêm từ vựng', 'error');
    }
  };

  const handleCsvUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      window.showToast('Vui lòng chọn file CSV', 'warning');
      return;
    }
    if (!csvTopic) {
      window.showToast('Vui lòng nhập chủ đề cho file CSV', 'warning');
      return;
    }
    if (showCustomLanguageInputCsv && !csvLanguage.trim()) {
      window.showToast('Vui lòng nhập tên ngôn ngữ tùy chỉnh cho file CSV', 'warning');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', csvFile);
    formData.append('topic', csvTopic);
    formData.append('language', csvLanguage);

    try {
      const response = await axios.post('/api/vocabulary/bulk', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setCsvFile(null);
      setCsvTopic('');
      setCsvLanguage(defaultLanguage || 'english');
      setShowCustomLanguageInputCsv(false);
      fetchVocabularies();
      window.showToast(`Import thành công! Đã thêm ${response.data.length} từ vựng.`, 'success');
    } catch (error) {
      console.error('Error uploading CSV:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi import file CSV';
      window.showToast(`Lỗi: ${errorMessage}`, 'error');
    } finally {
      setUploading(false);
    }
  };

  // Sau khi xóa từ vựng thành công, update lại cache
  const handleDelete = async (id) => {
    window.showAlert({
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc muốn xóa từ vựng này?',
      type: 'warning',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      requirePassword: true,
      onConfirm: async () => {
        try {
          await axios.delete(`/api/vocabulary/${id}`);
          // Gọi lại API và update cache
          const response = await axios.get('/api/vocabulary');
          setVocabularies(response.data);
          localStorage.setItem('vocabularies', JSON.stringify(response.data));
          window.showToast('Đã xóa từ vựng thành công', 'success');
        } catch (error) {
          console.error('Error deleting vocabulary:', error);
          window.showToast('Có lỗi xảy ra khi xóa từ vựng', 'error');
        }
      }
    });
  };

  // Thêm nút làm mới để user chủ động refresh data từ DB
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/vocabulary');
      setVocabularies(response.data);
      localStorage.setItem('vocabularies', JSON.stringify(response.data));
      window.showToast('Đã làm mới dữ liệu từ server!', 'success');
    } catch (error) {
      window.showToast('Lỗi khi làm mới dữ liệu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vocab) => {
    navigate(`/edit-vocabulary/${vocab._id}`, {
      state: {
        from: 'vocabulary',
        showList,
        expandedLanguages,
        expandedTopics,
        _restoreUI: true,
        scrollY: window.scrollY
      }
    });
  };

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

  const groupVocabulariesByLanguage = () => {
    const grouped = {};
    vocabularies.forEach(vocab => {
      if (!grouped[vocab.language]) {
        grouped[vocab.language] = {};
      }
      if (!grouped[vocab.language][vocab.topic]) {
        grouped[vocab.language][vocab.topic] = [];
      }
      grouped[vocab.language][vocab.topic].push(vocab);
    });
    return grouped;
  };

  const toggleLanguage = (language) => {
    setExpandedLanguages(prev => ({
      ...prev,
      [language]: !prev[language]
    }));
  };

  const toggleTopic = (language, topic) => {
    const key = `${language}-${topic}`;
    setExpandedTopics(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleLanguageChange = (value) => {
    if (value === 'other') {
      setShowCustomLanguageInput(true);
      setFormData({ ...formData, language: '', topic: '' });
    } else {
      setShowCustomLanguageInput(false);
      setFormData({ ...formData, language: value, topic: '' });
      
      // Tự động chuyển sang "Chủ đề mới" nếu không có chủ đề nào cho ngôn ngữ này
      const topicsForLanguage = getTopicsByLanguage(value);
      if (topicsForLanguage.length === 0) {
        setSelectedTopicOption('new');
        setShowCustomTopicInput(true);
      }
    }
  };

  const handleCsvLanguageChange = (value) => {
    if (value === 'other') {
      setShowCustomLanguageInputCsv(true);
      setCsvLanguage('');
    } else {
      setShowCustomLanguageInputCsv(false);
      setCsvLanguage(value);
    }
  };

  const getTopicsByLanguage = (language) => {
    const topics = new Set();
    vocabularies.forEach(vocab => {
      if (vocab.language === language) {
        topics.add(vocab.topic);
      }
    });
    return Array.from(topics).sort();
  };

  const handleTopicOptionChange = (option) => {
    setSelectedTopicOption(option);
    if (option === 'new') {
      setShowCustomTopicInput(true);
      setFormData({ ...formData, topic: '' });
    } else {
      setShowCustomTopicInput(false);
      setFormData({ ...formData, topic: '' });
    }
  };

  const handleImageTypeChange = (type) => {
    setImageInputType(type);
    setImageFile(null);
    setImagePreview('');
    setFormData({ ...formData, imageUrl: '' });
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file); // Đúng key

    try {
      const response = await axios.post('https://flashcardapp-otyt.onrender.com/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setLastUploadedImageUrl(response.data.url);
      return response.data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Có lỗi xảy ra khi upload hình ảnh');
    }
  };

  // Hàm xóa ảnh trên server
  const deleteUploadedImage = async (url) => {
    if (url && url.startsWith('/uploads/')) {
      try {
        await axios.delete('/api/upload', { params: { url } });
      } catch (err) {
        // Có thể log hoặc bỏ qua lỗi xóa file
      }
    }
  };

  useEffect(() => {
    if (
      location.state &&
      location.state.scrollY !== undefined &&
      !loading
    ) {
      let count = 0;
      const scrollToPosition = () => {
        window.scrollTo(0, location.state.scrollY);
        count++;
        if (count < 10) {
          requestAnimationFrame(scrollToPosition);
        }
      };
      scrollToPosition();
    }
  }, [loading]);

  // Xóa ảnh khi input imageUrl bị xóa
  useEffect(() => {
    if (!formData.imageUrl && lastUploadedImageUrl) {
      deleteUploadedImage(lastUploadedImageUrl);
      setLastUploadedImageUrl('');
    }
    // eslint-disable-next-line
  }, [formData.imageUrl]);
  // Xóa ảnh khi đóng form
  useEffect(() => {
    if (!showForm && lastUploadedImageUrl) {
      deleteUploadedImage(lastUploadedImageUrl);
      setLastUploadedImageUrl('');
    }
    // eslint-disable-next-line
  }, [showForm]);

  // Nếu danh sách chủ đề sẵn có rỗng, tự động chọn 'Chủ đề mới'
  useEffect(() => {
    if (showForm && getTopicsByLanguage(formData.language).length === 0 && selectedTopicOption !== 'new') {
      setSelectedTopicOption('new');
    }
  }, [showForm, formData.language]);

  // Hàm kiểm tra validation cho form
  const getFormValidationErrors = () => {
    const errors = [];
    
    if (!formData.word.trim()) {
      errors.push('Từ vựng');
    }
    
    if (!formData.meaning.trim()) {
      errors.push('Nghĩa');
    }
    
    // Ngôn ngữ luôn bắt buộc, không phụ thuộc vào default language
    if (showCustomLanguageInput && !formData.language.trim()) {
      errors.push('Ngôn ngữ tùy chỉnh');
    } else if (!showCustomLanguageInput && !formData.language) {
      errors.push('Ngôn ngữ');
    }
    
    if (!formData.topic.trim()) {
      errors.push('Chủ đề');
    }
    
    // Hình ảnh là optional, không cần validation
    
    return errors;
  };

  const formValidationErrors = getFormValidationErrors();
  const isFormValid = formValidationErrors.length === 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const groupedVocabularies = groupVocabulariesByLanguage();
  const totalLanguages = Object.keys(groupedVocabularies).length;
  const totalTitles = Object.values(groupedVocabularies).reduce((total, topics) => total + Object.keys(topics).length, 0);
  const totalWords = vocabularies.length;

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      {/* Header với nút quay lại */}
      <div className="mb-2">
        <button
          onClick={() => navigate('/vocabulary')}
          className="flex items-center text-gray-500 hover:text-primary-600 transition-colors text-base"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Quay lại
        </button>
      </div>

      <div className="mb-10 flex flex-col items-center justify-center select-none">
        <span className="mb-2">
          <BookOpen className="h-14 w-14 drop-shadow-lg text-transparent bg-gradient-to-tr from-blue-400 via-green-400 to-yellow-400 bg-clip-text" />
        </span>
        <h1 className="text-5xl font-extrabold text-transparent bg-gradient-to-tr from-blue-600 via-green-600 to-yellow-500 bg-clip-text drop-shadow-lg tracking-tight mb-2 leading-tight overflow-visible whitespace-pre-line p-2">
          Quản lý từ vựng
        </h1>
        <span className="text-base text-gray-500 font-medium mb-4">Thêm, sửa, xóa và quản lý từ vựng của bạn</span>
        <div className="w-24 h-1 rounded-full bg-gradient-to-r from-blue-400 via-green-400 to-yellow-300 mb-4" />
        <button
          onClick={() => setShowForm(!showForm)}
          className="group flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-blue-500 to-green-400 text-white rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 font-bold text-lg mb-2"
        >
          <Plus className="h-6 w-6 transition-transform group-hover:rotate-90" />
          Thêm từ mới
        </button>
      </div>

      {/* Add Vocabulary Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Thêm từ vựng mới</h2>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDefaultLanguageModal(true)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                title="Cài đặt ngôn ngữ mặc định"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Từ vựng *
                </label>
                <input
                  type="text"
                  required
                  value={formData.word}
                  onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Nhập từ vựng"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngôn ngữ
                </label>
                <LanguageDropdown
                  value={showCustomLanguageInput ? 'other' : (formData.language || 'english')}
                  onChange={handleLanguageChange}
                  className="w-full"
                />
                {!showCustomLanguageInput && formData.language && (
                  <p className="text-sm text-blue-600 mt-1">
                    Đã chọn: <strong>{getLanguageName(formData.language)}</strong>
                  </p>
                )}
                {defaultLanguage && formData.language === defaultLanguage && (
                  <p className="text-sm text-green-600 mt-1">
                    Đang sử dụng ngôn ngữ mặc định: <strong>{getLanguageName(defaultLanguage)}</strong>
                  </p>
                )}
                {showCustomLanguageInput && (
                  <div>
                    <input
                      type="text"
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 mt-2"
                      placeholder="Nhập tên ngôn ngữ"
                      required
                    />
                    {formData.language && (
                      <p className="text-sm text-green-600 mt-1">
                        Ngôn ngữ tùy chỉnh: <strong>{formData.language}</strong>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nghĩa *
              </label>
              <input
                type="text"
                required
                value={formData.meaning}
                onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Nhập nghĩa của từ"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hình ảnh (tùy chọn)
              </label>
              
              {/* Image Input Type Selection */}
              <div className="mb-3">
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="imageInputType"
                      value="url"
                      checked={imageInputType === 'url'}
                      onChange={(e) => handleImageTypeChange(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">URL hình ảnh</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="imageInputType"
                      value="file"
                      checked={imageInputType === 'file'}
                      onChange={(e) => handleImageTypeChange(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Upload từ thiết bị</span>
                  </label>
                </div>
              </div>

              {/* URL Input */}
              {imageInputType === 'url' && (
                <div>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://example.com/image.jpg"
                    onPaste={async (e) => {
                      if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
                        const file = e.clipboardData.files[0];
                        if (file.type.startsWith('image/')) {
                          window.showToast && window.showToast('Đang upload ảnh...', 'info');
                          try {
                            const formDataUpload = new FormData();
                            formDataUpload.append('image', file);
                            const response = await axios.post('/api/upload', formDataUpload, {
                              headers: { 'Content-Type': 'multipart/form-data' },
                            });
                            setFormData((prev) => ({ ...prev, imageUrl: response.data.url }));
                            setLastUploadedImageUrl(response.data.url);
                            window.showToast && window.showToast('Upload ảnh thành công!', 'success');
                          } catch (err) {
                            window.showToast && window.showToast('Upload ảnh thất bại!', 'error');
                          }
                          e.preventDefault();
                        }
                      }
                    }}
                  />
                  {formData.imageUrl && (
                    <div className="mt-2 flex items-center">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="h-20 w-20 object-cover rounded shadow border cursor-pointer"
                        onClick={() => {
                          setModalImageUrl(formData.imageUrl);
                          setShowImageModal(true);
                        }}
                        onError={e => e.target.style.display='none'}
                      />
                      <button
                        type="button"
                        className="ml-2 px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-xs"
                        onClick={() => setFormData({ ...formData, imageUrl: '' })}
                      >
                        Xóa ảnh
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* File Upload */}
              {imageInputType === 'file' && (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chủ đề *
              </label>
              
              {/* Topic Option Selection */}
              <div className="mb-3">
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="topicOption"
                      value="existing"
                      checked={selectedTopicOption === 'existing'}
                      onChange={(e) => handleTopicOptionChange(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Chủ đề sẵn có</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="topicOption"
                      value="new"
                      checked={selectedTopicOption === 'new'}
                      onChange={(e) => handleTopicOptionChange(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Chủ đề mới</span>
                  </label>
                </div>
              </div>

              {/* Existing Topics Dropdown */}
              {selectedTopicOption === 'existing' && (
                <div>
                  <select
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Chọn chủ đề</option>
                    {getTopicsByLanguage(formData.language).map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* New Topic Input */}
              {selectedTopicOption === 'new' && (
                <input
                  type="text"
                  required
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Nhập tên chủ đề mới"
                />
              )}
            </div>
            
            {/* Validation Messages */}
            {formValidationErrors.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-2">Vui lòng điền đầy đủ thông tin bắt buộc:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {formValidationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={!isFormValid}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                Thêm từ vựng
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CSV Upload */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Import từ file CSV theo chủ đề</h2>
        <form onSubmit={handleCsvUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chọn file CSV
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files[0])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              File CSV cần có các cột: word, meaning, imageUrl (tùy chọn)
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chủ đề cho file CSV *
              </label>
              <input
                type="text"
                required
                value={csvTopic}
                onChange={(e) => setCsvTopic(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Ví dụ: Động vật, Thực phẩm, Giao thông..."
              />
              <p className="text-sm text-gray-500 mt-1">
                Tất cả từ vựng trong file CSV sẽ được gán vào chủ đề này
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngôn ngữ cho file CSV *
              </label>
              <LanguageDropdown
                value={showCustomLanguageInputCsv ? 'other' : (csvLanguage || 'english')}
                onChange={handleCsvLanguageChange}
                className="w-full"
              />
              {!showCustomLanguageInputCsv && csvLanguage && (
                <p className="text-sm text-blue-600 mt-1">
                  Đã chọn: <strong>{getLanguageName(csvLanguage)}</strong>
                </p>
              )}
              {defaultLanguage && csvLanguage === defaultLanguage && (
                <p className="text-sm text-green-600 mt-1">
                  Đang sử dụng ngôn ngữ mặc định: <strong>{getLanguageName(defaultLanguage)}</strong>
                </p>
              )}
              {showCustomLanguageInputCsv && (
                <div>
                  <input
                    type="text"
                    value={csvLanguage}
                    onChange={(e) => setCsvLanguage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 mt-2"
                    placeholder="Nhập tên ngôn ngữ"
                    required
                  />
                  {csvLanguage && (
                    <p className="text-sm text-green-600 mt-1">
                      Ngôn ngữ tùy chỉnh: <strong>{csvLanguage}</strong>
                    </p>
                  )}
                </div>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Tất cả từ vựng trong file CSV sẽ được gán vào ngôn ngữ này
              </p>
            </div>
          </div>
          <button
            type="submit"
            disabled={!csvFile || !csvTopic || (showCustomLanguageInputCsv ? !csvLanguage.trim() : !csvLanguage) || uploading}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Đang upload...' : 'Import CSV'}
          </button>
        </form>
      </div>

      {/* View List Button */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Xem danh sách từ vựng</h2>
            <p className="text-gray-600 mt-1">
              <span className="hidden sm:inline">Xem từ vựng theo cấu trúc Languages → Titles → Words</span>
              <span className="sm:hidden block">Languages → Titles → Words</span>
            </p>
          </div>
                      <button
              onClick={() => setShowList(!showList)}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
            <List className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">
              {showList ? 'Ẩn danh sách' : 'Xem danh sách'}
            </span>
          </button>
        </div>
      </div>

      {/* Vocabulary List with Hierarchical Structure */}
      {showList && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Danh sách từ vựng</h2>
              <div className="text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <Globe className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline mr-1">{totalLanguages}</span>
                    <span className="sm:hidden">{totalLanguages}</span>
                    <span className="hidden sm:inline">Languages</span>
                  </span>
                  <span className="flex items-center">
                    <FolderOpen className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline mr-1">{totalTitles}</span>
                    <span className="sm:hidden">{totalTitles}</span>
                    <span className="hidden sm:inline">Titles</span>
                  </span>
                  <span className="flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline mr-1">{totalWords}</span>
                    <span className="sm:hidden">{totalWords}</span>
                    <span className="hidden sm:inline">Words</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {Object.keys(groupedVocabularies).length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-500">
                <p className="text-lg mb-2">Chưa có từ vựng nào</p>
                <p className="text-sm">Hãy thêm từ vựng đầu tiên để bắt đầu!</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {Object.entries(groupedVocabularies).map(([language, topics]) => {
                const languageTotalWords = Object.values(topics).reduce((total, topicVocabs) => total + topicVocabs.length, 0);
                const languageTotalTitles = Object.keys(topics).length;
                
                return (
                  <div key={language} className="bg-white">
                    {/* Language Header */}
                                        <div 
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors"
                      onClick={() => toggleLanguage(language)}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <Globe className="h-6 w-6 text-blue-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {getLanguageName(language)}
                          </h3>
                          <p className="text-sm text-gray-600">Language</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 flex-shrink-0 ml-4">
                        <div className="flex items-center justify-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full w-16">
                          <span className="font-semibold text-xs">{languageTotalTitles}</span>
                          <span className="hidden sm:inline text-xs ml-1">Titles</span>
                        </div>
                        <div className="flex items-center justify-center px-2 py-1 bg-green-100 text-green-800 rounded-full w-16">
                          <span className="font-semibold text-xs">{languageTotalWords}</span>
                          <span className="hidden sm:inline text-xs ml-1">Words</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                        {expandedLanguages[language] ? (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                    </div>

                    {/* Titles */}
                    {expandedLanguages[language] && (
                      <div className="border-t border-gray-200">
                        {Object.entries(topics).map(([topic, topicVocabularies]) => (
                          <div key={topic} className="border-b border-gray-100 last:border-b-0">
                            {/* Title Header */}
                            <div 
                              className="flex items-center justify-between p-3 bg-gray-25 cursor-pointer hover:bg-gray-50 transition-colors"
                              onClick={() => toggleTopic(language, topic)}
                            >
                              <div className="flex items-center space-x-3">
                                <FolderOpen className="h-4 w-4 text-green-600" />
                                <div>
                                  <h4 className="font-medium text-gray-900">{topic}</h4>
                                  <p className="text-xs text-gray-500">Title</p>
                                </div>
                                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                  <span className="hidden sm:inline">{topicVocabularies.length} Words</span>
                                  <span className="sm:hidden">{topicVocabularies.length}</span>
                                </span>
                              </div>

                              <div>
                                {expandedTopics[`${language}-${topic}`] ? (
                                  <ChevronDown className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-gray-500" />
                                )}
                              </div>
                            </div>

                            {/* Words List */}
                            {expandedTopics[`${language}-${topic}`] && (
                              <div className="bg-white">
                                {topicVocabularies.map((vocab) => (
                                  <div key={vocab._id} className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                          <FileText className="h-4 w-4 text-purple-600" />
                                          <h5 className="text-lg font-semibold text-gray-900">{vocab.word}</h5>
                                          <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                                            Word
                                          </span>
                                        </div>
                                        <p className="text-gray-600 mb-3">{vocab.meaning}</p>
                                        <div className="flex items-center space-x-4">
                                          <div className="w-16 h-16 rounded-lg border overflow-hidden">
                                            {vocab.imageUrl && vocab.imageUrl.startsWith('http') ? (
                                              <img
                                                src={vocab.imageUrl}
                                                alt="Ảnh từ vựng"
                                                className="w-full h-full object-cover"
                                                onError={e => e.target.style.display='none'}
                                              />
                                            ) : (
                                              <div className="w-16 h-16 flex items-center justify-center text-xs text-gray-500 bg-gray-100 rounded border">
                                                Not found
                                              </div>
                                            )}
                                          </div>
                                          <span className="text-sm text-gray-500">
                                            Thêm lúc: {new Date(vocab.createdAt).toLocaleDateString('vi-VN')}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="relative">
                                        <DropdownMenu
                                          trigger={<MoreVertical className="h-5 w-5" />}
                                          options={[
                                            {
                                              label: 'Chỉnh sửa',
                                              icon: <Edit className="h-4 w-4 mr-2" />,
                                              onClick: () => handleEdit(vocab),
                                            },
                                            {
                                              label: 'Xóa',
                                              icon: <Trash2 className="h-4 w-4 mr-2" />,
                                              onClick: () => handleDelete(vocab._id),
                                              danger: true
                                            }
                                          ]}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      {/* Modal xem trước ảnh lớn */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
          onClick={() => setShowImageModal(false)}
        >
          <div className="bg-white rounded-lg p-2 shadow-lg relative max-w-full max-h-full flex flex-col items-center"
            style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.25)' }}
          >
            <img
              src={modalImageUrl}
              alt="Preview lớn"
              className="object-contain"
              style={{
                maxWidth: '96vw',
                maxHeight: '80vh',
                width: 'min(700px, 96vw)',
                height: 'auto',
                borderRadius: '0.5rem',
              }}
              onClick={e => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Modal cài đặt ngôn ngữ mặc định */}
      {showDefaultLanguageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
          onClick={() => setShowDefaultLanguageModal(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 shadow-lg relative max-w-md w-full mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Cài đặt ngôn ngữ mặc định</h3>
              <button
                onClick={() => setShowDefaultLanguageModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">
                Ngôn ngữ mặc định sẽ được tự động chọn khi vào trang quản lý từ vựng. Bạn vẫn có thể thay đổi sang ngôn ngữ khác.
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngôn ngữ hiện tại:
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md">
                    {defaultLanguage ? (
                      <span className="text-blue-600 font-medium">
                        {getLanguageName(defaultLanguage)}
                      </span>
                    ) : (
                      <span className="text-gray-500 italic">Chưa cài đặt</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn ngôn ngữ mặc định:
                  </label>
                  <LanguageDropdown
                    value={defaultLanguage || ''}
                    onChange={(value) => {
                      if (value === 'other') {
                        // Xử lý ngôn ngữ tùy chỉnh
                        const customLanguage = prompt('Nhập tên ngôn ngữ tùy chỉnh:');
                        if (customLanguage && customLanguage.trim()) {
                          setDefaultLanguageAPI(customLanguage.trim());
                          setShowDefaultLanguageModal(false);
                        }
                      } else {
                        setDefaultLanguageAPI(value);
                        setShowDefaultLanguageModal(false);
                      }
                    }}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDefaultLanguageModal(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
              {defaultLanguage && (
                <button
                  onClick={() => {
                    setDefaultLanguageAPI('');
                    setShowDefaultLanguageModal(false);
                  }}
                  className="px-4 py-2 text-red-600 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
                >
                  Xóa mặc định
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VocabularyManager; 