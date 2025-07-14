import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from '../../axiosConfig';
import { ArrowLeft, Trash2, BookOpen } from 'lucide-react';

function EditVocabulary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || 'vocabulary';
  const [loading, setLoading] = useState(true);
  const [vocab, setVocab] = useState(null);
  const [form, setForm] = useState({
    word: '',
    meaning: '',
    imageUrl: '',
    language: '',
    topic: ''
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchVocab();
  }, [id]);

  const fetchVocab = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/vocabulary/${id}`);
      setVocab(res.data);
      setForm({
        word: res.data.word || '',
        meaning: res.data.meaning || '',
        imageUrl: res.data.imageUrl || '',
        language: res.data.language || '',
        topic: res.data.topic || ''
      });
    } catch (err) {
      window.showToast('Không tìm thấy từ vựng', 'error');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(`/api/vocabulary/${id}`, form);
      window.showToast('Đã cập nhật từ vựng!', 'success');
      // Fetch lại dữ liệu mới nhất
      await fetchVocab();
    } catch (err) {
      window.showToast('Lỗi khi cập nhật', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    window.showAlert({
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc muốn xóa từ vựng này?',
      type: 'warning',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      onConfirm: async () => {
        setDeleting(true);
        try {
          await axios.delete(`/api/vocabulary/${id}`);
          window.showToast('Đã xóa từ vựng!', 'success');
          navigate(from === 'dashboard' ? '/dashboard' : '/vocabulary');
        } catch (err) {
          window.showToast('Lỗi khi xóa', 'error');
        } finally {
          setDeleting(false);
        }
      }
    });
  };

  const handleBack = () => {
    if (from === 'dashboard') {
      const scrollY = location.state && location.state.scrollY !== undefined ? location.state.scrollY : window.scrollY;
      if (location.state && (location.state.selectedLanguage !== undefined || location.state.selectedTopic !== undefined)) {
        navigate('/dashboard', { state: { ...location.state, _restoreFilter: true, scrollY } });
      } else {
        navigate('/dashboard', { state: { scrollY } });
      }
    } else if (location.state && location.state._restoreUI) {
      navigate('/vocabulary', { state: { ...location.state, _restoreUI: true } });
    } else {
      navigate('/vocabulary');
    }
  };

  // So sánh dữ liệu form với vocab gốc
  const isChanged = vocab && (
    form.word !== (vocab.word || '') ||
    form.meaning !== (vocab.meaning || '') ||
    form.imageUrl !== (vocab.imageUrl || '')
  );

  // Hàm chuyển mã ngôn ngữ sang tiếng Việt, nếu không phải 4 ngôn ngữ mặc định thì giữ nguyên
  const getLanguageName = (code) => {
    const languages = {
      'english': 'Tiếng Anh',
      'korean': 'Tiếng Hàn',
      'japanese': 'Tiếng Nhật',
      'chinese': 'Tiếng Trung'
    };
    if (!code) return '';
    return languages[code] || code;
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
            onClick={handleBack}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Quay lại {from === 'dashboard' ? 'Dashboard' : 'Quản lý từ vựng'}
          </button>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Chỉnh sửa từ vựng
              </h1>
              <p className="text-gray-600 mt-1">
                Từ vựng: <span className="font-semibold text-blue-600">{vocab.word}</span>
                {vocab.meaning && (
                  <span className="ml-2 text-gray-500">| Nghĩa: <span className="font-medium">{vocab.meaning}</span></span>
                )}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Ngôn ngữ: <span className="font-medium">{getLanguageName(vocab.language)}</span> | Chủ đề: <span className="font-medium">{vocab.topic}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Thông tin từ vựng</h2>
        <form className="space-y-4" onSubmit={handleSave}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngôn ngữ
            </label>
            <input
              type="text"
              value={getLanguageName(form.language)}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chủ đề
            </label>
            <input
              type="text"
              value={form.topic}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Từ vựng
            </label>
            <input
              type="text"
              name="word"
              value={form.word}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nghĩa
            </label>
            <input
              type="text"
              name="meaning"
              value={form.meaning}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh (URL)
            </label>
            <input
              type="text"
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {form.imageUrl && (
              <img src={form.imageUrl} alt="preview" className="mt-3 h-28 rounded border" onError={e => e.target.style.display='none'} />
            )}
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={saving || !isChanged}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Đang lưu...
                </>
              ) : (
                <>Lưu thay đổi</>
              )}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa từ vựng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditVocabulary; 