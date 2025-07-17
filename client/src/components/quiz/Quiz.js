import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Play, RotateCcw, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quizType, setQuizType] = useState('word-to-image');
  const [questionCount, setQuestionCount] = useState(10);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [correctVocabulary, setCorrectVocabulary] = useState(null);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [vocabCount, setVocabCount] = useState(0);
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('all');
  // Thêm state cho số từ vựng phù hợp và chế độ nhập số câu custom
  const [filteredVocabCount, setFilteredVocabCount] = useState(0);
  const [questionMode, setQuestionMode] = useState('preset'); // 'preset' | 'custom' | 'all'
  const [customQuestionCount, setCustomQuestionCount] = useState('');
  const [questionError, setQuestionError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const allowNavigateRef = useRef(false);
  const isBlocking = questions.length > 0 && !showResult;

  // Thêm useEffect để lắng nghe sự kiện thoát trang
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isQuizActive && questions.length > 0 && !showResult) {
        e.preventDefault();
        e.returnValue = 'Bạn có chắc chắn muốn thoát khỏi bài kiểm tra? Tiến độ hiện tại sẽ bị mất.';
        return 'Bạn có chắc chắn muốn thoát khỏi bài kiểm tra? Tiến độ hiện tại sẽ bị mất.';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isQuizActive, questions.length, showResult]);

  // Intercept click vào các thẻ <a> nội bộ khi đang kiểm tra
  useEffect(() => {
    if (!isBlocking) return;
    const handleClick = (e) => {
      const anchor = e.target.closest('a[href]');
      if (
        anchor &&
        anchor.origin === window.location.origin &&
        anchor.pathname !== location.pathname
      ) {
        e.preventDefault();
        window.showAlert({
          title: 'Xác nhận thoát bài kiểm tra',
          message: 'Bạn có chắc chắn muốn thoát khỏi bài kiểm tra? Tiến độ hiện tại sẽ bị mất.',
          type: 'warning',
          confirmText: 'Thoát',
          cancelText: 'Hủy',
          showCancel: true,
          onConfirm: () => {
            allowNavigateRef.current = true;
            navigate(anchor.pathname + anchor.search + anchor.hash, { replace: false });
          }
        });
      }
    };
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [isBlocking, navigate, location.pathname]);

  useEffect(() => {
    // Lấy số lượng từ vựng từ localStorage
    const cached = localStorage.getItem('vocabularies');
    if (cached) {
      try {
        const arr = JSON.parse(cached);
        setVocabCount(Array.isArray(arr) ? arr.length : 0);
      } catch {
        setVocabCount(0);
      }
    } else {
      setVocabCount(0);
    }
  }, []);

  // Lấy danh sách ngôn ngữ khi mount (luôn lấy từ API, không lấy localStorage)
  useEffect(() => {
    axios.get('/api/languages').then(res => setLanguages(res.data)).catch(() => setLanguages([]));
  }, []);

  // Hàm filter vocabularies theo ngôn ngữ/chủ đề
  useEffect(() => {
    if (!selectedLanguage) {
      setFilteredVocabCount(0);
      return;
    }
    const cached = localStorage.getItem('vocabularies');
    if (cached) {
      try {
        const arr = JSON.parse(cached);
        const filtered = arr.filter(v => v.language === selectedLanguage && (selectedTopic === 'all' || v.topic === selectedTopic));
        setFilteredVocabCount(filtered.length);
      } catch {
        setFilteredVocabCount(0);
      }
    } else {
      setFilteredVocabCount(0);
    }
  }, [selectedLanguage, selectedTopic]);

  // Khi chọn ngôn ngữ, lấy danh sách chủ đề
  useEffect(() => {
    if (selectedLanguage) {
      axios.get(`/api/topics/${selectedLanguage}`).then(res => setTopics(res.data)).catch(() => setTopics([]));
      setSelectedTopic('all');
    } else {
      setTopics([]);
      setSelectedTopic('all');
    }
  }, [selectedLanguage]);

  const startQuiz = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/quiz?type=${quizType}&count=${questionCount}&language=${selectedLanguage}&topic=${selectedTopic}`);
      setQuestions(response.data);
      setCurrentQuestion(0);
      setScore(0);
      setShowResult(false);
      setSelectedAnswer(null);
      setAnswered(false);
      setShowCorrectAnswer(false);
      setCorrectAnswer(null);
      setCorrectVocabulary(null);
      setIsQuizActive(true);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      window.showToast('Có lỗi xảy ra khi tạo bài kiểm tra. Hãy đảm bảo có ít nhất 4 từ vựng.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = async (answerId) => {
    if (answered) return;

    setSelectedAnswer(answerId);
    setAnswered(true);

    const currentQ = questions[currentQuestion];

    if (currentQ.type === 'image-fill-word') {
      const userAnswer = (selectedAnswer || '').trim().toLowerCase();
      const correct = (currentQ.correctAnswer || '').trim().toLowerCase();
      setAnswered(true);
      if (userAnswer === correct) {
        setScore(score + 1);
        setTimeout(() => {
          nextQuestion();
        }, 1000);
      } else {
        setShowCorrectAnswer(true);
        setCorrectAnswer({ text: currentQ.correctAnswer });
        setCorrectVocabulary(currentQ.vocabulary);
      }
      return;
    }

    // Chỉ chạy phần này nếu có answers (tức là word-to-image hoặc image-to-word)
    const selectedAnswerObj = currentQ.answers?.find(a => a.id === answerId);
    const correctAnswerObj = currentQ.answers?.find(a => a.isCorrect);

    if (selectedAnswerObj && selectedAnswerObj.isCorrect) {
      setScore(score + 1);
      setTimeout(() => {
        nextQuestion();
      }, 1000);
    } else if (selectedAnswerObj) {
      setCorrectAnswer(correctAnswerObj);
      setShowCorrectAnswer(true);
      let vocabularyData;
      if (currentQ.vocabulary) {
        vocabularyData = {
          word: currentQ.vocabulary.word,
          meaning: currentQ.vocabulary.meaning,
          topic: currentQ.vocabulary.topic,
          imageUrl: currentQ.vocabulary.imageUrl
        };
      } else {
        vocabularyData = {
          word: correctAnswerObj.text || correctAnswerObj.word,
          meaning: correctAnswerObj.meaning,
          topic: correctAnswerObj.topic,
          imageUrl: correctAnswerObj.imageUrl
        };
      }
      setCorrectVocabulary(vocabularyData);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      setShowCorrectAnswer(false);
      setCorrectAnswer(null);
      setCorrectVocabulary(null);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setQuestions([]);
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setAnswered(false);
    setShowCorrectAnswer(false);
    setCorrectAnswer(null);
    setCorrectVocabulary(null);
    setIsQuizActive(false);
  };

  const getAnswerClass = (answerId) => {
    if (!answered) return 'quiz-option';
    
    const currentQ = questions[currentQuestion];
    const answer = currentQ.answers.find(a => a.id === answerId);
    
    if (answer.isCorrect) {
      return 'quiz-option correct';
    } else if (selectedAnswer === answerId) {
      return 'quiz-option incorrect';
    }
    
    return 'quiz-option';
  };

  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Kết quả bài kiểm tra</h1>
            
            <div className="mb-6">
              <div className="text-6xl font-bold text-primary-600 mb-2">{percentage}%</div>
              <div className="text-xl text-gray-600">
                {score}/{questions.length} câu đúng
              </div>
            </div>

            <div className="mb-8">
              {percentage >= 80 && (
                <div className="text-green-600 text-lg font-semibold">
                  🎉 Xuất sắc! Bạn đã làm rất tốt!
                </div>
              )}
              {percentage >= 60 && percentage < 80 && (
                <div className="text-blue-600 text-lg font-semibold">
                  👍 Tốt! Hãy tiếp tục luyện tập!
                </div>
              )}
              {percentage < 60 && (
                <div className="text-orange-600 text-lg font-semibold">
                  📚 Cần ôn tập thêm để cải thiện!
                </div>
              )}
            </div>

            <div className="flex space-x-4 justify-center mb-6">
              <button
                onClick={resetQuiz}
                className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Làm lại
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Về trang chủ
              </button>
              <Link
                to="/statistics"
                className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Xem thống kê
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-10 flex flex-col items-center justify-center select-none">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-500 hover:text-primary-600 transition-colors text-sm mb-2 self-start"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Về trang chủ
            </button>
            <span className="mb-2">
              <Play className="h-14 w-14 drop-shadow-lg text-transparent bg-gradient-to-tr from-green-400 via-blue-400 to-purple-500 bg-clip-text" />
            </span>
            <h1 className="text-5xl font-extrabold text-transparent bg-gradient-to-tr from-green-600 via-blue-600 to-purple-600 bg-clip-text drop-shadow-lg tracking-tight mb-2">
              Bài kiểm tra
            </h1>
            <span className="text-base text-gray-500 font-medium mb-4">Kiểm tra và luyện tập từ vựng của bạn</span>
            <div className="w-24 h-1 rounded-full bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 mb-2" />
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Hàng 1 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">🌐 Ngôn ngữ kiểm tra</label>
                {/* select ngôn ngữ */}
                <select
                  value={selectedLanguage}
                  onChange={e => setSelectedLanguage(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
                  disabled={languages.length === 0}
                >
                  {languages.length === 0 ? (
                    <option value="" disabled>Không có ngôn ngữ</option>
                  ) : (
                    <option value="" disabled>Chọn ngôn ngữ</option>
                  )}
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">📂 Chủ đề kiểm tra</label>
                {/* select chủ đề */}
                <select
                  value={topics.length === 0 ? "" : selectedTopic}
                  onChange={e => setSelectedTopic(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
                  disabled={!selectedLanguage}
                >
                  {topics.length === 0 ? (
                    <option value="" disabled>Không có chủ đề</option>
                  ) : (
                    <>
                      <option value="all">Tất cả chủ đề</option>
                      {topics.map(topic => (
                        <option key={topic} value={topic}>{topic}</option>
                      ))}
                    </>
                  )}
                </select>
              </div>
              {/* Hàng 2 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">📊 Số câu hỏi</label>
                {questionMode === 'custom' ? (
                  <>
                    <input
                      type="number"
                      value={customQuestionCount}
                      onChange={e => {
                        const val = e.target.value;
                        setCustomQuestionCount(val);
                        if (val === '') {
                          setQuestionError('Vui lòng nhập số câu hỏi');
                          setQuestionCount('');
                          return;
                        }
                        const num = Number(val);
                        if (isNaN(num) || num < 1) {
                          setQuestionError('Số câu hỏi phải lớn hơn 0');
                          setQuestionCount('');
                        } else if (num > filteredVocabCount) {
                          setQuestionError(`Tối đa ${filteredVocabCount} câu`);
                          setQuestionCount('');
                        } else {
                          setQuestionError('');
                          setQuestionCount(num);
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder={`Nhập số câu (1-${filteredVocabCount})`}
                    />
                    {questionError && (
                      <div className="text-red-500 text-sm mt-1">{questionError}</div>
                    )}
                  </>
                ) : (
                  <select
                    value={questionMode === 'custom' ? 'custom' : (questionMode === 'all' ? 'all' : questionCount)}
                    onChange={e => {
                      if (e.target.value === 'custom') {
                        setQuestionMode('custom');
                        setCustomQuestionCount('');
                        setQuestionCount('');
                        setQuestionError('');
                      } else if (e.target.value === 'all') {
                        setQuestionMode('all');
                        setQuestionCount(filteredVocabCount);
                        setQuestionError('');
                      } else {
                        setQuestionMode('preset');
                        setQuestionCount(Number(e.target.value));
                        setQuestionError('');
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
                    disabled={languages.length === 0 || filteredVocabCount === 0}
                  >
                    {languages.length === 0 || filteredVocabCount === 0 ? (
                      <option value={0}>0 câu</option>
                    ) : (
                      <>
                        {filteredVocabCount >= 5 && <option value={5}>5 câu</option>}
                        {filteredVocabCount >= 10 && <option value={10}>10 câu</option>}
                        {filteredVocabCount >= 20 && <option value={20}>20 câu</option>}
                        {filteredVocabCount >= 30 && <option value={30}>30 câu</option>}
                        {filteredVocabCount >= 50 && <option value={50}>50 câu</option>}
                        {filteredVocabCount >= 100 && <option value={100}>100 câu</option>}
                        {filteredVocabCount >= 200 && <option value={200}>200 câu</option>}
                        {filteredVocabCount >= 300 && <option value={300}>300 câu</option>}
                        {filteredVocabCount >= 500 && <option value={500}>500 câu</option>}
                        {filteredVocabCount >= 1000 && <option value={1000}>1000 câu</option>}
                        <option value="all">Toàn bộ ({filteredVocabCount} câu)</option>
                        <option value="custom">Khác...</option>
                      </>
                    )}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">📝 Loại bài kiểm tra</label>
                <select
                  value={quizType}
                  onChange={(e) => setQuizType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
                  disabled={languages.length === 0}
                >
                  <option value="word-to-image">🔤 Nhìn từ → Chọn hình</option>
                  <option value="image-to-word">🖼️ Nhìn hình → Chọn từ</option>
                  <option value="mixed">🎲 Hỗn hợp</option>
                </select>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={startQuiz}
                disabled={loading || vocabCount < 4 || !selectedLanguage || (topics.length > 0 && !selectedTopic) || languages.length === 0}
                className={`w-full md:w-auto px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 ${loading || vocabCount < 4 || !selectedLanguage || (topics.length > 0 && !selectedTopic) || languages.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Play className="h-5 w-5 mr-3 inline" />
                {loading ? '⏳ Đang tạo bài kiểm tra...' : '🚀 Bắt đầu bài kiểm tra'}
              </button>
              {vocabCount < 4 && (
                <div className="text-red-500 text-sm mt-2">Cần ít nhất 4 từ vựng để tạo bài kiểm tra.</div>
              )}
              {!selectedLanguage && (
                <div className="text-red-500 text-sm mt-2">Vui lòng chọn ngôn ngữ kiểm tra.</div>
              )}
              {selectedLanguage && topics.length === 0 && (
                <div className="text-red-500 text-sm mt-2">Không có chủ đề nào cho ngôn ngữ này.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Câu hỏi {currentQuestion + 1}/{questions.length}
            </span>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">
                Điểm: {score}/{questions.length}
              </span>
              <button
                onClick={() => {
                  window.showAlert({
                    title: 'Xác nhận thoát bài kiểm tra',
                    message: 'Bạn có chắc chắn muốn thoát khỏi bài kiểm tra? Tiến độ hiện tại sẽ bị mất.',
                    type: 'warning',
                    confirmText: 'Thoát',
                    cancelText: 'Tiếp tục',
                    showCancel: true,
                    onConfirm: () => {
                      resetQuiz();
                    }
                  });
                }}
                className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
              >
                Thoát bài kiểm tra
              </button>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {currentQ.type === 'image-to-word' ? 'Chọn từ đúng cho hình ảnh này:' : 'Chọn hình ảnh đúng cho từ này:'}
            </h2>
            
            {/* Đáp án lựa chọn (4 ô) */}
            <div className="mb-8">
              {currentQ.type === 'word-to-image' && (
                <>
                  <div className="text-4xl font-bold text-primary-600 mb-6 text-center">
                    {currentQ.question}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQ.answers.map((answer) => (
                      <button
                        key={answer.id}
                        onClick={() => handleAnswerSelect(answer.id)}
                        disabled={answered}
                        className={`${getAnswerClass(answer.id)} p-4 border-2 border-gray-200 rounded-lg text-left transition-all duration-200`}
                      >
                        <div className="flex justify-center">
                          <div className="max-w-full max-h-32 rounded overflow-hidden">
                            <img
                              src={answer.imageUrl}
                              alt="Answer"
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div 
                              className="w-full h-full flex items-center justify-center text-xs text-gray-500 bg-gray-100 hidden"
                              style={{ minHeight: '80px' }}
                            >
                              Not found
                            </div>
                          </div>
                        </div>
                        {answered && (
                          <div className="flex justify-center mt-2">
                            {answer.isCorrect ? (
                              <CheckCircle className="h-6 w-6 text-green-600" />
                            ) : selectedAnswer === answer.id ? (
                              <XCircle className="h-6 w-6 text-red-600" />
                            ) : null}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
              {currentQ.type === 'image-to-word' && (
                <>
                  <div className="flex justify-center mb-6">
                    <div className="max-w-md max-h-64 rounded-lg border overflow-hidden">
                      <img
                        src={currentQ.question}
                        alt="Question"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div 
                        className="w-full h-full flex items-center justify-center text-gray-500 bg-gray-100 hidden"
                        style={{ minHeight: '200px' }}
                      >
                        Not found
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQ.answers.map((answer) => (
                      <button
                        key={answer.id}
                        onClick={() => handleAnswerSelect(answer.id)}
                        disabled={answered}
                        className={`${getAnswerClass(answer.id)} p-4 border-2 border-gray-200 rounded-lg text-left transition-all duration-200`}
                      >
                        <div className="text-lg font-semibold text-center">{answer.text}</div>
                        {answered && (
                          <div className="flex justify-center mt-2">
                            {answer.isCorrect ? (
                              <CheckCircle className="h-6 w-6 text-green-600" />
                            ) : selectedAnswer === answer.id ? (
                              <XCircle className="h-6 w-6 text-red-600" />
                            ) : null}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
              {currentQ.type === 'image-fill-word' && (
                <div className="flex flex-col items-center">
                  <div className="max-w-md max-h-64 rounded-lg border overflow-hidden mb-6">
                    <img
                      src={currentQ.question}
                      alt="Question"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div 
                      className="w-full h-full flex items-center justify-center text-gray-500 bg-gray-100 hidden"
                      style={{ minHeight: '200px' }}
                    >
                      Not found
                    </div>
                  </div>
                  <input
                    type="text"
                    value={selectedAnswer || ''}
                    onChange={e => setSelectedAnswer(e.target.value)}
                    disabled={answered}
                    className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg text-center"
                    placeholder="Nhập đáp án..."
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !answered) handleAnswerSelect('fill-word');
                    }}
                  />
                  {answered && (
                    <div className="mt-4">
                      {selectedAnswer && selectedAnswer.trim().toLowerCase() === (currentQ.correctAnswer || '').trim().toLowerCase() ? (
                        <span className="text-green-600 font-semibold flex items-center"><CheckCircle className="h-5 w-5 mr-1" /> Đúng!</span>
                      ) : (
                        <span className="text-red-600 font-semibold flex items-center"><XCircle className="h-5 w-5 mr-1" /> Sai! Đáp án đúng: <b className="ml-1">{currentQ.correctAnswer}</b></span>
                      )}
                    </div>
                  )}
                  {!answered && (
                    <button
                      onClick={() => handleAnswerSelect('fill-word')}
                      className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                    >
                      Kiểm tra
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Navigation */}
            {answered && (
              <div className="flex justify-center">
                <button
                  onClick={nextQuestion}
                  className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  {currentQuestion < questions.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Card giải thích đáp án đúng, tách biệt hoàn toàn */}
        {showCorrectAnswer && correctVocabulary && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-green-500 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              Đáp án đúng
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center mb-3">
                  <h4 className="font-semibold text-gray-800 mr-3">Từ vựng:</h4>
                  <div className="text-2xl font-bold text-primary-600">
                    {correctVocabulary.word || 'Không có từ vựng'}
                  </div>
                </div>
                <div className="text-gray-600 mb-2">
                  <strong>Nghĩa:</strong> {correctVocabulary.meaning || 'Đang tải...'}
                </div>
                {correctVocabulary.topic && (
                  <div className="text-sm text-gray-500">
                    <strong>Chủ đề:</strong> {correctVocabulary.topic}
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Hình ảnh:</h4>
                <div className="flex justify-center">
                  <div className="max-w-lg max-h-64 rounded-lg border overflow-hidden">
                    <img
                      src={correctVocabulary.imageUrl}
                      alt={correctVocabulary.word}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div 
                      className="w-full h-full flex items-center justify-center text-gray-500 bg-gray-100 hidden"
                      style={{ minHeight: '200px' }}
                    >
                      Not found
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Quiz; 