import React, {
  createContext,
  useContext,
  useState,
  Suspense,
  lazy,
} from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import Navbar from './components/Navbar';

/* ─── Contexts ──────────────────────────────────────────────────────────── */

export const LanguageContext = createContext({
  language: 'EN',
  toggleLanguage: () => {},
});

export const TeacherModeContext = createContext({
  teacherMode: false,
  toggleTeacherMode: () => {},
});

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useTeacherMode() {
  return useContext(TeacherModeContext);
}

/* ─── Lazy-loaded pages ─────────────────────────────────────────────────── */

const Home              = lazy(() => import('./pages/Home'));
const ProgressDashboard = lazy(() => import('./pages/ProgressDashboard'));
const IntroNLP          = lazy(() => import('./pages/modules/IntroNLP'));
const TextPreprocessing = lazy(() => import('./pages/modules/TextPreprocessing'));
const BagOfWords        = lazy(() => import('./pages/modules/BagOfWords'));
const SentimentAnalysis = lazy(() => import('./pages/modules/SentimentAnalysis'));
const Ngrams            = lazy(() => import('./pages/modules/Ngrams'));
const ChatbotSim        = lazy(() => import('./pages/modules/ChatbotSim'));
const MLInNLP           = lazy(() => import('./pages/modules/MLInNLP'));
const AIEthics          = lazy(() => import('./pages/modules/AIEthics'));

/* ─── Loading fallback ──────────────────────────────────────────────────── */

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-soft-purple">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full border-4 border-primary-200 border-t-primary-500 animate-spin" />
        <p className="text-primary-600 font-semibold animate-pulse">Loading module…</p>
      </div>
    </div>
  );
}

/* ─── App ───────────────────────────────────────────────────────────────── */

export default function App() {
  const [language, setLanguage] = useState('EN');
  const [teacherMode, setTeacherMode] = useState(false);

  function toggleLanguage() {
    setLanguage(prev => (prev === 'EN' ? 'HI' : 'EN'));
  }

  function toggleTeacherMode() {
    setTeacherMode(prev => !prev);
  }

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      <TeacherModeContext.Provider value={{ teacherMode, toggleTeacherMode }}>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/"           element={<Home />} />
                  <Route path="/module/1"   element={<IntroNLP />} />
                  <Route path="/module/2"   element={<TextPreprocessing />} />
                  <Route path="/module/3"   element={<BagOfWords />} />
                  <Route path="/module/4"   element={<SentimentAnalysis />} />
                  <Route path="/module/5"   element={<Ngrams />} />
                  <Route path="/module/6"   element={<ChatbotSim />} />
                  <Route path="/module/7"   element={<MLInNLP />} />
                  <Route path="/module/8"   element={<AIEthics />} />
                  <Route path="/progress"   element={<ProgressDashboard />} />
                  {/* Fallback – redirect unknown paths to home */}
                  <Route path="*"           element={<Home />} />
                </Routes>
              </Suspense>
            </main>
          </div>
        </Router>
      </TeacherModeContext.Provider>
    </LanguageContext.Provider>
  );
}
