import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart3, BookOpen, Globe, FolderOpen, Trash2, MoreVertical, Edit, ArrowLeft, Grid } from 'lucide-react';
import DropdownMenu from '../util/DropdownMenu';

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [vocabularies, setVocabularies] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    fetchVocabularies();
  }, [selectedLanguage, selectedTopic]);

  // Khôi phục filter khi quay lại
  useEffect(() => {
    if (location.state && location.state._restoreFilter) {
      if (location.state.selectedLanguage !== undefined) setSelectedLanguage(location.state.selectedLanguage);
      if (location.state.selectedTopic !== undefined) setSelectedTopic(location.state.selectedTopic);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('/api/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVocabularies = async () => {
    try {
      const params = {};
      if (selectedLanguage) params.language = selectedLanguage;
      if (selectedTopic) params.topic = selectedTopic;
      
      const response = await axios.get('/api/vocabulary', { params });
      setVocabularies(response.data);
    } catch (error) {
      console.error('Error fetching vocabularies:', error);
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

  const getTotalWords = () => {
    return stats.reduce((total, stat) => total + stat.totalWords, 0);
  };

  const getTotalTopics = () => {
    return stats.reduce((total, stat) => total + stat.topics.length, 0);
  };

  const handleDeleteTopic = async (language, topic) => {
    const languageName = getLanguageName(language);
    window.showAlert({
      title: 'Xác nhận xóa chủ đề',
      message: `Bạn có chắc muốn xóa tất cả từ vựng trong chủ đề "${topic}" của ${languageName}?`,
      type: 'warning',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      onConfirm: async () => {
        try {
          const response = await axios.delete(`/api/vocabulary/topic/${encodeURIComponent(topic)}?language=${language}`);
          window.showToast(response.data.message, 'success');
          fetchDashboardStats();
          fetchVocabularies();
        } catch (error) {
          console.error('Error deleting topic:', error);
          window.showToast('Có lỗi xảy ra khi xóa chủ đề', 'error');
        }
      }
    });
  };

  const handleDeleteLanguage = async (language) => {
    const languageName = getLanguageName(language);
    window.showAlert({
      title: 'Xác nhận xóa ngôn ngữ',
      message: `Bạn có chắc muốn xóa tất cả từ vựng trong ngôn ngữ ${languageName}?`,
      type: 'warning',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      onConfirm: async () => {
        try {
          const response = await axios.delete(`/api/vocabulary/language/${language}`);
          window.showToast(response.data.message, 'success');
          fetchDashboardStats();
          fetchVocabularies();
        } catch (error) {
          console.error('Error deleting language:', error);
          window.showToast('Có lỗi xảy ra khi xóa ngôn ngữ', 'error');
        }
      }
    });
  };

  const handleEditLanguage = (language) => {
    // Navigate to edit page
    window.location.href = `/edit-language/${language}`;
  };

  const handleEditTopic = (language, topic) => {
    // Navigate to edit page
    window.location.href = `/edit-topic/${language}/${encodeURIComponent(topic)}`;
  };

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const handleEditVocabulary = (id) => {
    navigate(`/edit-vocabulary/${id}`, {
      state: {
        from: 'dashboard',
        selectedLanguage,
        selectedTopic,
        _restoreFilter: true,
        scrollY: window.scrollY
      }
    });
  };
  const handleDeleteVocabulary = async (id) => {
    // Có thể dùng logic xóa cũ hoặc show confirm
    if (!window.confirm('Bạn có chắc muốn xóa từ vựng này?')) return;
    try {
      await axios.delete(`/api/vocabulary/${id}`);
      window.showToast('Đã xóa từ vựng!', 'success');
      fetchVocabularies();
    } catch (err) {
      window.showToast('Lỗi khi xóa', 'error');
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 flex flex-col items-center justify-center select-none">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-4 self-start"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Về trang chủ
        </button>
        <span className="mb-2">
          <Grid className="h-14 w-14 drop-shadow-lg text-transparent bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 bg-clip-text" />
        </span>
        <h1 className="text-5xl font-extrabold text-transparent bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-500 bg-clip-text drop-shadow-lg tracking-tight mb-2 leading-tight overflow-visible whitespace-pre-line p-2">
          Dashboard
        </h1>
        <span className="text-base text-gray-500 font-medium mb-4">Tổng quan học tập của bạn</span>
        <div className="w-24 h-1 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-2" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tổng từ vựng</p>
              <p className="text-2xl font-bold text-gray-900">{getTotalWords()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Globe className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Ngôn ngữ</p>
              <p className="text-2xl font-bold text-gray-900">{stats.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FolderOpen className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Chủ đề</p>
              <p className="text-2xl font-bold text-gray-900">{getTotalTopics()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Trung bình</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.length > 0 ? Math.round(getTotalWords() / stats.length) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Bộ lọc</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngôn ngữ
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Tất cả ngôn ngữ</option>
              {stats.map((stat) => (
                <option key={stat._id} value={stat._id}>
                  {getLanguageName(stat._id)}
                </option>
              ))}
            </select>
          </div>
                      <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chủ đề
              </label>
                          <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Tất cả chủ đề</option>
              {stats
                .filter(stat => !selectedLanguage || stat._id === selectedLanguage)
                .flatMap(stat => stat.topics)
                .map((topic, index) => (
                  <option key={index} value={topic.topic}>
                    {topic.topic} ({topic.count})
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

              {/* Language and Title Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Language Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Thống kê theo ngôn ngữ</h2>
          <div className="space-y-4">
            {stats.map((stat) => (
              <div key={stat._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">
                      {getLanguageName(stat._id)}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-primary-600">
                      {stat.totalWords} từ
                    </span>
                    <DropdownMenu
                      trigger={<MoreVertical className="h-4 w-4" />}
                      options={[
                        {
                          label: 'Chỉnh sửa',
                          icon: <Edit className="h-4 w-4 mr-2" />,
                          onClick: () => handleEditLanguage(stat._id)
                        },
                        {
                          label: 'Xóa',
                          icon: <Trash2 className="h-4 w-4 mr-2" />,
                          onClick: () => handleDeleteLanguage(stat._id),
                          danger: true
                        }
                      ]}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  {stat.topics.map((topic, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <span className="text-gray-600 truncate" title={topic.topic}>
                          {topic.topic}
                        </span>
                      </div>
                      <span className="text-gray-900 font-medium flex-shrink-0 mr-2">{topic.count} từ</span>
                      <DropdownMenu
                        trigger={<MoreVertical className="h-3 w-3" />}
                        options={[
                          {
                            label: 'Chỉnh sửa',
                            icon: <Edit className="h-3 w-3 mr-2" />,
                            onClick: () => handleEditTopic(stat._id, topic.topic)
                          },
                          {
                            label: 'Xóa',
                            icon: <Trash2 className="h-3 w-3 mr-2" />,
                            onClick: () => handleDeleteTopic(stat._id, topic.topic),
                            danger: true
                          }
                        ]}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

                  {/* Title Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Thống kê theo chủ đề</h2>
          <div className="space-y-4">
            {stats
              .filter(stat => !selectedLanguage || stat._id === selectedLanguage)
              .flatMap(stat => stat.topics)
              .reduce((acc, topic) => {
                const existing = acc.find(t => t.topic === topic.topic);
                if (existing) {
                  existing.count += topic.count;
                } else {
                  acc.push({ ...topic });
                }
                return acc;
              }, [])
              .sort((a, b) => b.count - a.count)
              .map((topic, index) => (
                <div key={index} className="flex justify-between items-center border-b border-gray-200 pb-2 last:border-b-0">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <span className="font-medium text-gray-900 truncate" title={topic.topic}>
                      {topic.topic}
                    </span>
                  </div>
                  <span className="text-primary-600 font-bold flex-shrink-0 mr-2">{topic.count} từ</span>
                  <DropdownMenu
                    trigger={<MoreVertical className="h-3 w-3" />}
                    options={[
                      {
                        label: 'Chỉnh sửa',
                        icon: <Edit className="h-3 w-3 mr-2" />,
                        onClick: () => handleEditTopic(selectedLanguage || 'all', topic.topic)
                      },
                      {
                        label: 'Xóa',
                        icon: <Trash2 className="h-3 w-3 mr-2" />,
                        onClick: () => handleDeleteTopic(selectedLanguage || 'all', topic.topic),
                        danger: true
                      }
                    ]}
                  />
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Filtered Vocabulary List */}
      {(selectedLanguage || selectedTopic) && (
        <div className="mt-8 bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">
              Từ vựng đã lọc ({vocabularies.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {vocabularies.map((vocab) => (
              <div key={vocab._id} className="p-6">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900">{vocab.word}</h3>
                      <span className="px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-full">
                        {vocab.language}
                      </span>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        {vocab.topic}
                      </span>
                    </div>
                    <DropdownMenu
                      trigger={<MoreVertical className="h-5 w-5" />}
                      options={[
                        {
                          label: 'Chỉnh sửa',
                          icon: <Edit className="h-4 w-4 mr-2" />,
                          onClick: () => handleEditVocabulary(vocab._id)
                        },
                        {
                          label: 'Xóa',
                          icon: <Trash2 className="h-4 w-4 mr-2" />,
                          onClick: () => handleDeleteVocabulary(vocab._id),
                          danger: true
                        }
                      ]}
                    />
                  </div>
                  <p className="text-gray-600 mb-3">{vocab.meaning}</p>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-lg border overflow-hidden">
                      {vocab.imageUrl ? (
                        <img
                          src={vocab.imageUrl}
                          alt={vocab.word}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-full h-full flex items-center justify-center text-xs text-gray-500 bg-gray-100 ${vocab.imageUrl ? 'hidden' : 'flex'}`}
                        style={{ display: vocab.imageUrl ? 'none' : 'flex' }}
                      >
                        Not found
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      Thêm lúc: {new Date(vocab.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {vocabularies.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                Không có từ vựng nào phù hợp với bộ lọc.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard; 