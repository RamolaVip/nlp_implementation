import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../App';
import StepByStepPipeline from '../../components/StepByStepPipeline';
import { wordTokenize, generateNgrams } from '../../utils/nlpHelpers';

/* ── Constants ─────────────────────────────────────────────────────────── */

const PIPELINE_STEPS = [
  {
    icon: '📝', label: 'Input Text', color: 'bg-pink-100',
    description: 'Provide a sentence or paragraph. N-grams work on any sequence of tokens.',
    example: '"I love machine learning and NLP"',
  },
  {
    icon: '🔤', label: 'Tokenize', color: 'bg-blue-100',
    description: 'Split the input into individual word tokens — the building blocks for generating N-grams.',
    example: '["I", "love", "machine", "learning", "and", "NLP"]',
  },
  {
    icon: '🪟', label: 'Slide Window', color: 'bg-purple-100',
    description: 'Slide a window of size N across the token list. Each window position produces one N-gram.',
    example: 'Window size 2 → ["I love"], ["love machine"], ["machine learning"], …',
  },
  {
    icon: '📋', label: 'Collect N-grams', color: 'bg-emerald-100',
    description: 'Collect all windows to form the full list of N-grams. Count their frequencies to build a frequency table.',
    example: 'Bigrams: {["I love"]: 1, ["love machine"]: 1, ["machine learning"]: 1, …}',
  },
  {
    icon: '🔮', label: 'Predict / Model', color: 'bg-orange-100',
    description: 'Use the frequency table as a language model. Given the last N−1 words, predict the most likely next word.',
    example: '"machine" → most likely next: "learning" (highest bigram frequency)',
  },
];

const SAMPLE_SENTENCES = [
  'I love machine learning and natural language processing',
  'The cat sat on the mat and ate the rat',
  'Natural language processing is a branch of artificial intelligence',
  'Students learn NLP concepts through interactive demos and quizzes',
];

/* ── Component ─────────────────────────────────────────────────────────── */

export default function Ngrams() {
  const { language } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [n, setN] = useState(2);
  const [generated, setGenerated] = useState(false);

  function generate(text) {
    const t = (text ?? inputText).trim();
    if (!t) return;
    setGenerated(true);
  }

  function loadSample(text) {
    setInputText(text);
    setGenerated(true);
  }

  const tokens = useMemo(() => wordTokenize(inputText), [inputText]);
  const ngrams = useMemo(() => generated ? generateNgrams(tokens, n) : [], [generated, tokens, n]);

  const freqMap = useMemo(() => {
    const map = {};
    ngrams.forEach(g => { map[g] = (map[g] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [ngrams]);

  const maxFreq = freqMap.length > 0 ? freqMap[0][1] : 1;

  const TAB_COLORS = { 1: 'bg-pink-500', 2: 'bg-rose-500', 3: 'bg-purple-500' };
  const TAB_LABELS = { 1: 'Unigrams', 2: 'Bigrams', 3: 'Trigrams' };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl text-4xl bg-gradient-to-br from-pink-400 to-rose-500 shadow-lg mb-4">🔗</div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Module 5</p>
        <h1 className="text-4xl font-black gradient-text mb-3">
          {language === 'EN' ? 'N-grams' : 'एन-ग्राम'}
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto text-lg">
          {language === 'EN'
            ? 'Model word sequences with bigrams and trigrams for language prediction.'
            : 'भाषा भविष्यवाणी के लिए बाइग्राम और ट्राइग्राम के साथ शब्द अनुक्रमों को मॉडल करें।'}
        </p>
      </motion.div>

      {/* ── Concept Card ───────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-pink-50 border border-pink-200 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-pink-700 mb-2">
          💡 {language === 'EN' ? 'What are N-grams?' : 'N-gram क्या हैं?'}
        </h2>
        <p className="text-gray-600 leading-relaxed">
          {language === 'EN'
            ? 'An N-gram is a contiguous sequence of N items (words or characters) from text. Unigrams are single words, bigrams are pairs, and trigrams are triples. N-grams are the backbone of language models that power autocomplete, speech recognition, and machine translation.'
            : 'N-gram टेक्स्ट से N आइटम (शब्द या अक्षर) का एक सतत क्रम है। यूनिग्राम एकल शब्द हैं, बाइग्राम जोड़े हैं और ट्राइग्राम तिकड़ी हैं।'}
        </p>
      </motion.div>

      {/* ── Pipeline ───────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card">
        <StepByStepPipeline
          steps={PIPELINE_STEPS}
          title={language === 'EN' ? 'N-gram Generation Pipeline' : 'N-gram जनरेशन पाइपलाइन'}
        />
      </motion.div>

      {/* ── Interactive Demo ────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="card space-y-4">
        <h2 className="text-xl font-bold text-gray-800">
          🧪 {language === 'EN' ? 'N-gram Generator' : 'N-gram जेनरेटर'}
        </h2>

        {/* Sample sentences */}
        <div className="flex flex-wrap gap-2">
          {SAMPLE_SENTENCES.map((s, i) => (
            <button key={i} onClick={() => loadSample(s)}
              className="text-xs px-3 py-1.5 bg-pink-100 text-pink-700 rounded-full hover:bg-pink-200 transition-colors">
              Sample {i + 1}
            </button>
          ))}
        </div>

        {/* Input */}
        <textarea
          value={inputText}
          onChange={e => { setInputText(e.target.value); setGenerated(false); }}
          placeholder={language === 'EN' ? 'Enter a sentence to generate N-grams…' : 'N-gram बनाने के लिए एक वाक्य दर्ज करें…'}
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-pink-400 focus:outline-none resize-none"
          rows={2}
        />

        {/* N selector + button */}
        <div className="flex gap-3 items-center flex-wrap">
          <span className="text-sm text-gray-600 font-medium">{language === 'EN' ? 'N =' : 'N ='}</span>
          {[1, 2, 3].map(val => (
            <button key={val}
              onClick={() => { setN(val); setGenerated(false); }}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                n === val ? `${TAB_COLORS[val]} text-white shadow` : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}>
              {val} — {TAB_LABELS[val]}
            </button>
          ))}
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => generate()}
            disabled={!inputText.trim()}
            className="ml-auto bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold px-5 py-2 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all text-sm">
            {language === 'EN' ? '⚡ Generate' : '⚡ जेनरेट करें'}
          </motion.button>
        </div>

        {/* Results */}
        <AnimatePresence>
          {generated && tokens.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-4">

              {/* Tokens */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  🔤 {language === 'EN' ? `Tokens (${tokens.length})` : `टोकन (${tokens.length})`}
                </p>
                <div className="flex flex-wrap gap-2">
                  {tokens.map((t, i) => (
                    <motion.span key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-sm font-mono">
                      {t}
                    </motion.span>
                  ))}
                </div>
              </div>

              {ngrams.length === 0 ? (
                <p className="text-sm text-gray-400 italic text-center py-4">
                  {language === 'EN'
                    ? `Not enough tokens to form ${n}-grams. Need at least ${n} words.`
                    : `${n}-gram बनाने के लिए कम से कम ${n} शब्द चाहिए।`}
                </p>
              ) : (
                <>
                  {/* N-gram pills */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                      🔗 {language === 'EN' ? `${TAB_LABELS[n]} (${ngrams.length} total)` : `${TAB_LABELS[n]} (${ngrams.length} कुल)`}
                    </p>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                      {ngrams.map((g, i) => (
                        <motion.span key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: Math.min(i * 0.03, 0.5) }}
                          className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm font-semibold">
                          {g}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  {/* Frequency table */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                      📊 {language === 'EN' ? 'Frequency Table' : 'आवृत्ति तालिका'}
                    </p>
                    <div className="space-y-2 max-h-56 overflow-y-auto">
                      {freqMap.map(([gram, freq], i) => (
                        <motion.div key={gram} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: Math.min(i * 0.04, 0.6) }}
                          className="flex items-center gap-3">
                          <span className="font-mono text-sm text-gray-700 w-48 truncate shrink-0">"{gram}"</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${(freq / maxFreq) * 100}%` }}
                              transition={{ duration: 0.6, delay: i * 0.04 }}
                              className="h-2.5 rounded-full bg-gradient-to-r from-pink-400 to-rose-500" />
                          </div>
                          <span className="text-sm font-bold text-gray-500 w-4 text-right">{freq}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <Link to="/module/4" className="btn-secondary">← Module 4</Link>
        <Link to="/progress" className="text-sm text-gray-400 hover:text-primary-500 transition-colors">
          📊 {language === 'EN' ? 'View Progress' : 'प्रगति देखें'}
        </Link>
        <Link to="/module/6" className="btn-primary">Module 6 →</Link>
      </div>

    </div>
  );
}
