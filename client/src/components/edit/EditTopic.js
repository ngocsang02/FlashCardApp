import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save, Trash2, Edit } from 'lucide-react';

function EditTopic() {
  const { language, topic } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [vocabularies, setVocabularies] = useState([]);
  const [newTopic, setNewTopic] = useState(decodeURIComponent(topic));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const from = ""; // Nếu cần lấy từ router, hãy thay thế bằng giá trị phù hợp

  useEffect(() => {
    fetchVocabularies();
  }, [language, topic]);

  const fetchVocabularies = async () => {
    try {
      const response = await axios.get(`/api/vocabulary?language=${language}&topic=${decodeURIComponent(topic)}`);
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

  const handleSave = async () => {
    if (newTopic.trim() === decodeURIComponent(topic)) {
      window.showToast('Không có thay đổi nào', 'info');
      return;
    }

    setSaving(true);
    try {
      // Update all vocabularies in this topic to new topic
      const updatePromises = vocabularies.map(vocab => 
        axios.put(`/api/vocabulary/${vocab._id}`, {
          ...vocab,
          topic: newTopic.trim()
        })
      );
      
      await Promise.all(updatePromises);
      window.showToast('Cập nhật thành công!', 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating topic:', error);
      window.showToast('Có lỗi xảy ra khi cập nhật', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    window.showAlert({
      title: 'Xác nhận xóa chủ đề',
      message: `Bạn có chắc muốn xóa tất cả từ vựng trong chủ đề ${decodeURIComponent(topic)}?`,
      type: 'delete',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      requirePassword: false,
      onConfirm: () => {
        window.showAlert({
          title: 'Nhập mật khẩu xác nhận',
          message: 'Vui lòng nhập mật khẩu 6 số để xác nhận xóa.',
          type: 'delete',
          confirmText: 'Xác nhận',
          cancelText: 'Hủy',
          requirePassword: true,
          onConfirm: async (password) => {
            setDeleting(true);
            try {
              await axios.delete(`/api/vocabulary/topic/${encodeURIComponent(decodeURIComponent(topic))}?language=${language}`);
              window.showToast(`Đã xóa chủ đề "${decodeURIComponent(topic)}"!`, 'success');
              navigate(from === 'dashboard' ? '/dashboard' : '/vocabulary/manage');
            } catch (err) {
              window.showToast('Lỗi khi xóa', 'error');
            } finally {
              setDeleting(false);
            }
          }
        });
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Quay lại Dashboard
          </button>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Edit className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Chỉnh sửa chủ đề
              </h1>
              <p className="text-gray-600 mt-1">
                Chủ đề: <span className="font-semibold text-blue-600">{decodeURIComponent(topic)}</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Ngôn ngữ: <span className="font-medium">{getLanguageName(language)}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Thông tin chủ đề</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngôn ngữ
            </label>
            <input
              type="text"
              value={getLanguageName(language)}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chủ đề hiện tại
            </label>
            <input
              type="text"
              value={decodeURIComponent(topic)}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thay đổi thành chủ đề
            </label>
            <input
              type="text"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Nhập tên chủ đề mới"
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleSave}
              disabled={saving || newTopic.trim() === decodeURIComponent(topic)}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa chủ đề
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">
            Danh sách từ vựng ({vocabularies.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {vocabularies.map((vocab) => (
            <div key={vocab._id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{vocab.word}</h3>
                    <span className="px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-full">
                      {vocab.language}
                    </span>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      {vocab.topic}
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
              </div>
            </div>
          ))}
          {vocabularies.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              Không có từ vựng nào trong chủ đề này.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EditTopic; 