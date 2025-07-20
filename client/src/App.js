import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BookOpen, Plus, Play, Home, BarChart3, Grid, Menu } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import VocabularyManager from './components/vocabulary/VocabularyManager';
import VocabularySelection from './components/vocabulary/VocabularySelection';
import VocabularyLearning from './components/vocabulary/VocabularyLearning';
import Quiz from './components/quiz/Quiz';
import HomePage from './components/home/HomePage';
import Dashboard from './components/dashboard/Dashboard';
import EditLanguage from './components/edit/EditLanguage';
import EditTopic from './components/edit/EditTopic';
import StatisticsPage from './components/statistics/StatisticsPage';
import AboutPage from './components/about/AboutPage';
import ToastContainer from './components/util/ToastContainer';
import AlertManager from './components/util/AlertManager';
import SimpleAlertManager from './components/util/SimpleAlertManager';
import EditVocabulary from './components/edit/EditVocabulary';

function NavIcon({ active, children, idGradient }) {
  return (
    <svg width="16" height="16" fill="none" stroke={active ? `url(#${idGradient})` : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 align-middle">
      {active && (
        <defs>
          <linearGradient id={idGradient} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
      )}
      {children}
    </svg>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isActive = (path) => {
    if (path === '/vocabulary') {
      return location.pathname === '/vocabulary' || location.pathname.startsWith('/vocabulary/') || location.pathname === '/quiz';
    }
    return location.pathname === path;
  };

  // Định nghĩa mapping route -> gradient cho text và border, giống tiêu đề từng màn hình
  const navGradients = {
    '/': {
      text: 'bg-gradient-to-tr from-purple-600 via-pink-600 to-orange-500',
      border: 'linear-gradient(to right, #a21caf, #db2777, #f59e42) 1'
    },
    '/dashboard': {
      text: 'bg-gradient-to-r from-purple-600 to-blue-500',
      border: 'linear-gradient(to right, #a21caf, #3b82f6) 1'
    },
    '/statistics': {
      text: 'bg-gradient-to-tr from-purple-600 via-pink-600 to-orange-500',
      border: 'linear-gradient(to right, #a21caf, #db2777, #f59e42) 1'
    },
    '/vocabulary': {
      text: 'bg-gradient-to-r from-blue-500 to-green-400',
      border: 'linear-gradient(to right, #3b82f6, #22c55e) 1'
    },
    '/quiz': {
      text: 'bg-gradient-to-r from-blue-500 to-green-400',
      border: 'linear-gradient(to right, #3b82f6, #22c55e) 1'
    },
    '/about': {
      text: 'bg-gradient-to-r from-indigo-500 to-purple-500',
      border: 'linear-gradient(to right, #6366f1, #8b5cf6) 1'
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <h1 className="ml-2 text-xl font-bold text-gray-900">
                Flashcard App
              </h1>
            </div>
            {/* Hamburger icon on mobile */}
            <div className="flex lg:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 focus:outline-none"
                aria-label="Open main menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
            {/* Nav items */}
            <div className={`flex-col lg:flex-row lg:flex items-center space-y-2 lg:space-y-0 lg:space-x-4 absolute lg:static top-16 left-0 w-full lg:w-auto bg-white lg:bg-transparent shadow-lg lg:shadow-none z-20 transition-all duration-200 ${menuOpen ? 'flex' : 'hidden'} lg:flex`}>
              <a
                href="/"
                className={`flex items-center px-3 py-2 text-sm font-medium transition-all duration-200 ${isActive('/') ? 'border-b-4' : ''}`}
                style={isActive('/') ? { borderImage: navGradients['/'].border, borderBottom: '4px solid' } : {}}
              >
                <span className={isActive('/') ? `${navGradients['/'].text} bg-clip-text text-transparent font-bold` : ''}>
                  Trang chủ
                </span>
              </a>
              <a
                href="/vocabulary"
                className={`flex items-center px-3 py-2 text-sm font-medium transition-all duration-200 ${isActive('/vocabulary') ? 'border-b-4' : ''}`}
                style={isActive('/vocabulary') ? { borderImage: navGradients['/vocabulary'].border, borderBottom: '4px solid' } : {}}
              >
                <span className={isActive('/vocabulary') ? `${navGradients['/vocabulary'].text} bg-clip-text text-transparent font-bold` : ''}>
                  Từ vựng
                </span>
              </a>
              <a
                href="/dashboard"
                className={`flex items-center px-3 py-2 text-sm font-medium transition-all duration-200 ${isActive('/dashboard') ? 'border-b-4' : ''}`}
                style={isActive('/dashboard') ? { borderImage: navGradients['/dashboard'].border, borderBottom: '4px solid' } : {}}
              >
                <span className={isActive('/dashboard') ? `${navGradients['/dashboard'].text} bg-clip-text text-transparent font-bold` : ''}>
                  Dashboard
                </span>
              </a>
              <a
                href="/statistics"
                className={`flex items-center px-3 py-2 text-sm font-medium transition-all duration-200 ${isActive('/statistics') ? 'border-b-4' : ''}`}
                style={isActive('/statistics') ? { borderImage: navGradients['/statistics'].border, borderBottom: '4px solid' } : {}}
              >
                <span className={isActive('/statistics') ? `${navGradients['/statistics'].text} bg-clip-text text-transparent font-bold` : ''}>
                  Thống kê
                </span>
              </a>
              <a
                href="/about"
                className={`flex items-center px-3 py-2 text-sm font-medium transition-all duration-200 ${isActive('/about') ? 'border-b-4' : ''}`}
                style={isActive('/about') ? { borderImage: navGradients['/about'].border, borderBottom: '4px solid' } : {}}
              >
                <span className={isActive('/about') ? `${navGradients['/about'].text} bg-clip-text text-transparent font-bold` : ''}>
                  About
                </span>
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vocabulary" element={<VocabularySelection />} />
          <Route path="/vocabulary/learn" element={<VocabularyLearning />} />
          <Route path="/vocabulary/manage" element={<VocabularyManager />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/edit-language/:language" element={<EditLanguage />} />
          <Route path="/edit-topic/:language/:topic" element={<EditTopic />} />
          <Route path="/edit-vocabulary/:id" element={<EditVocabulary />} />
        </Routes>
      </main>
      <ToastContainer />
      <AlertManager />
      <SimpleAlertManager />
    </div>
  );
}

export default App; 