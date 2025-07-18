import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronRight, ChevronDown, BookOpen, FolderOpen, Globe, FileText, Trash2, MoreVertical, Edit } from 'lucide-react';
import DropdownMenu from '../util/DropdownMenu';

function VocabularyList() {
  const [vocabularies, setVocabularies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedLanguages, setExpandedLanguages] = useState({});
  const [expandedTopics, setExpandedTopics] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    fetchVocabularies();
  }, []);

  const fetchVocabularies = async () => {
    try {
      const response = await axios.get('/api/vocabulary');
      setVocabularies(response.data);
    } catch (error) {
      console.error('Error fetching vocabularies:', error);
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

  const handleDelete = async (id) => {
    window.showAlert({
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc muốn xóa từ vựng này?',
      type: 'delete',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      requirePassword: true,
      onConfirm: async () => {
        try {
          await axios.delete(`/api/vocabulary/${id}`);
          fetchVocabularies();
        } catch (error) {
          console.error('Error deleting vocabulary:', error);
          alert('Có lỗi xảy ra khi xóa từ vựng');
        }
      }
    });
  };

  const handleDeleteTopic = async (language, topic) => {
    const languageName = getLanguageName(language);
    window.showAlert({
      title: 'Xác nhận xóa',
      message: `Bạn có chắc muốn xóa tất cả từ vựng trong chủ đề "${topic}" của ${languageName}?`,
      type: 'delete',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      requirePassword: true,
      onConfirm: async () => {
        try {
          const response = await axios.delete(`/api/vocabulary/topic/${encodeURIComponent(topic)}?language=${language}`);
          alert(response.data.message);
          fetchVocabularies();
        } catch (error) {
          console.error('Error deleting topic:', error);
          alert('Có lỗi xảy ra khi xóa chủ đề');
        }
      }
    });
  };

  const handleDeleteLanguage = async (language) => {
    const languageName = getLanguageName(language);
    window.showAlert({
      title: 'Xác nhận xóa',
      message: `Bạn có chắc muốn xóa tất cả từ vựng trong ngôn ngữ ${languageName}?`,
      type: 'delete',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      requirePassword: true,
      onConfirm: async () => {
        try {
          const response = await axios.delete(`/api/vocabulary/language/${language}`);
          alert(response.data.message);
          fetchVocabularies();
        } catch (error) {
          console.error('Error deleting language:', error);
          alert('Có lỗi xảy ra khi xóa ngôn ngữ');
        }
      }
    });
  };

  const handleEdit = (vocab) => {
    // TODO: Hiện modal chỉnh sửa
    alert('Chỉnh sửa: ' + vocab.word);
  };

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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Danh sách từ vựng</h1>
          <p className="text-gray-600 mt-1">Cấu trúc: Languages > Titles > Words</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Globe className="h-4 w-4 mr-1" />
                {totalLanguages} Languages
              </span>
              <span className="flex items-center">
                <FolderOpen className="h-4 w-4 mr-1" />
                {totalTitles} Titles
              </span>
              <span className="flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                {totalWords} Words
              </span>
            </div>
          </div>
        </div>
      </div>

      {Object.keys(groupedVocabularies).length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Chưa có từ vựng nào</h2>
          <p className="text-gray-600">Hãy thêm từ vựng đầu tiên để bắt đầu học!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedVocabularies).map(([language, topics]) => {
            const languageTotalWords = Object.values(topics).reduce((total, topicVocabs) => total + topicVocabs.length, 0);
            const languageTotalTitles = Object.keys(topics).length;
            
            return (
              <div key={language} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Language Header */}
                <div 
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors"
                  onClick={() => toggleLanguage(language)}
                >
                  <div className="flex items-center space-x-3">
                    <Globe className="h-6 w-6 text-blue-600" />
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {getLanguageName(language)}
                      </h2>
                      <p className="text-sm text-gray-600">Language</p>
                    </div>
                    <div className="flex space-x-2">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {languageTotalTitles} Titles
                      </span>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        {languageTotalWords} Words
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLanguage(language);
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title={`Xóa tất cả từ vựng trong ${getLanguageName(language)}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
                              <h3 className="font-medium text-gray-900">{topic}</h3>
                              <p className="text-xs text-gray-500">Title</p>
                            </div>
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              {topicVocabularies.length} Words
                            </span>
                          </div>
                                                        <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTopic(language, topic);
                                }}
                                className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title={`Xóa tất cả từ vựng trong chủ đề "${topic}"`}
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                              {expandedTopics[`${language}-${topic}`] ? (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-gray-500" />
                              )}
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
                                      <h4 className="text-lg font-semibold text-gray-900">{vocab.word}</h4>
                                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                                        Word
                                      </span>
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
  );
}

export default VocabularyList; 