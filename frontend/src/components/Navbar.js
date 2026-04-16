import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage, useTeacherMode } from '../App';

const MODULE_COLORS = [
  'bg-violet-500',  // 1
  'bg-blue-500',    // 2
  'bg-emerald-500', // 3
  'bg-amber-500',   // 4
  'bg-pink-500',    // 5
  'bg-cyan-500',    // 6
  'bg-orange-500',  // 7
  'bg-rose-500',    // 8
];

const translations = {
  EN: {
    brand: 'NLP Lab',
    modules: 'Modules',
    progress: 'Progress',
    teacherOn: 'Teacher Mode ON',
    teacherOff: 'Teacher Mode',
  },
  HI: {
    brand: 'NLP लैब',
    modules: 'मॉड्यूल',
    progress: 'प्रगति',
    teacherOn: 'शिक्षक मोड चालू',
    teacherOff: 'शिक्षक मोड',
  },
};

export default function Navbar() {
  const location = useLocation();
  const { language, toggleLanguage } = useLanguage();
  const { teacherMode, toggleTeacherMode } = useTeacherMode();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const t = translations[language];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const activeModule = location.pathname.startsWith('/module/')
    ? parseInt(location.pathname.split('/')[2], 10)
    : null;

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass shadow-soft border-b border-white/40'
          : 'bg-white/80 backdrop-blur-sm border-b border-white/20'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-shadow duration-200">
              <span className="text-white font-bold text-sm">NLP</span>
            </div>
            <span className="font-bold text-xl gradient-text hidden sm:block">
              {t.brand}
            </span>
          </Link>

          {/* Desktop: Module circles */}
          <div className="hidden md:flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
              <Link key={num} to={`/module/${num}`}>
                <motion.div
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white
                    transition-all duration-200 cursor-pointer
                    ${MODULE_COLORS[num - 1]}
                    ${activeModule === num ? 'ring-2 ring-offset-2 ring-primary-400 shadow-glow' : 'opacity-75 hover:opacity-100'}
                  `}
                  title={`Module ${num}`}
                >
                  {num}
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Desktop: Right controls */}
          <div className="hidden md:flex items-center gap-2">
            {/* Progress link */}
            <Link
              to="/progress"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                ${location.pathname === '/progress'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {t.progress}
            </Link>

            {/* Language toggle */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={toggleLanguage}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all duration-200
                ${language === 'HI'
                  ? 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
                  : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                }`}
              title="Toggle language"
            >
              {language === 'EN' ? '🇮🇳 HI' : '🇺🇸 EN'}
            </motion.button>

            {/* Teacher mode toggle */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={toggleTeacherMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200
                ${teacherMode
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              title="Toggle teacher mode (slow animations)"
            >
              {teacherMode ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )}
              <span className="hidden lg:block">
                {teacherMode ? t.teacherOn : t.teacherOff}
              </span>
            </motion.button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden glass border-t border-white/30 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              {/* Module grid */}
              <div>
                <p className="text-xs text-gray-500 font-medium mb-2">{t.modules}</p>
                <div className="grid grid-cols-8 gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <Link key={num} to={`/module/${num}`}>
                      <div className={`h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white
                        ${MODULE_COLORS[num - 1]}
                        ${activeModule === num ? 'ring-2 ring-offset-1 ring-primary-400' : 'opacity-80'}
                      `}>
                        {num}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Controls row */}
              <div className="flex items-center gap-2 pt-1">
                <Link
                  to="/progress"
                  className="flex-1 text-center py-2 rounded-lg bg-primary-50 text-primary-700 text-sm font-medium"
                >
                  📊 {t.progress}
                </Link>
                <button
                  onClick={toggleLanguage}
                  className="px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-semibold"
                >
                  {language === 'EN' ? '🇮🇳 HI' : '🇺🇸 EN'}
                </button>
                <button
                  onClick={toggleTeacherMode}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    teacherMode ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  🎓
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
