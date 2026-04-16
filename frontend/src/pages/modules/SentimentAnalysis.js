import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../App';
import StepByStepPipeline from '../../components/StepByStepPipeline';
import { getSentiment, wordTokenize } from '../../utils/nlpHelpers';

/* ── Constants ─────────────────────────────────────────────────────────── */

const PIPELINE_STEPS = [
  {
    icon: '📝', label: 'Input Text', color: 'bg-amber-100',
    description: 'Start with raw user-generated text: a product review, social-media post, or customer comment.',
    example: '"The movie was absolutely fantastic! I loved every minute."',
  },
  {
    icon: '🔤', label: 'Tokenize', color: 'bg-blue-100',
    description: 'Split the text into individual word tokens and convert everything to lowercase to normalize the input.',
    example: '["the", "movie", "was", "absolutely", "fantastic", "i", "loved", "every", "minute"]',
  },
  {
    icon: '🔍', label: 'Lexicon Lookup', color: 'bg-purple-100',
    description: 'Compare each token against a sentiment lexicon. Identify positive words, negative words, intensifiers ("very", "absolutely") and negations ("not", "never").',
    example: 'fantastic → ✅ POSITIVE  |  loved → ✅ POSITIVE  |  absolutely → ⚡ INTENSIFIER (×1.5)',
  },
  {
    icon: '📊', label: 'Score Calculation', color: 'bg-emerald-100',
    description: 'Sum the sentiment scores. Positive words add +1, negative words subtract −1. Intensifiers multiply by 1.5×, negations flip polarity (×−1.5).',
    example: 'fantastic(1 × 1.5) + loved(1) = 2.5  →  Score: +2.5',
  },
  {
    icon: '🏷️', label: 'Label & Output', color: 'bg-orange-100',
    description: 'Assign the final label based on the score: Positive (score > 0.3), Negative (score < −0.3), or Neutral (otherwise).',
    example: 'Score: +2.5  →  Label: 😊 POSITIVE',
  },
];

const SAMPLE_TEXTS = [
  'The food was absolutely delicious and the service was wonderful!',
  'This product is terrible and completely useless. I hate it.',
  'The weather is okay today, nothing special.',
  'I love this amazing app, it is so helpful and beautiful!',
  'The movie was not bad but also not great.',
];

const SENTIMENT_CONFIG = {
  positive: { emoji: '😊', label: 'Positive', labelHI: 'सकारात्मक', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-300' },
  negative: { emoji: '😠', label: 'Negative', labelHI: 'नकारात्मक', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-300' },
  neutral:  { emoji: '😐', label: 'Neutral',  labelHI: 'तटस्थ',     color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-300' },
};

const WORD_TAG_COLORS = {
  positive:         'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-300',
  negative:         'bg-red-100 text-red-700 ring-2 ring-red-300',
  'negated-positive': 'bg-orange-100 text-orange-700 ring-2 ring-orange-300',
  'negated-negative': 'bg-purple-100 text-purple-700 ring-2 ring-purple-300',
};

/* ── Component ─────────────────────────────────────────────────────────── */

export default function SentimentAnalysis() {
  const { language } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(null);

  function analyze(text) {
    const t = (text ?? inputText).trim();
    if (!t) return;
    const r = getSentiment(t);
    setResult({ ...r, tokens: wordTokenize(t) });
  }

  function loadSample(text) {
    setInputText(text);
    analyze(text);
  }

  const cfg = result ? SENTIMENT_CONFIG[result.sentiment] : null;
  const scoreBarPct = result ? Math.min(100, Math.max(0, 50 + result.score * 10)) : 50;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl text-4xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg mb-4">😊</div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Module 4</p>
        <h1 className="text-4xl font-black gradient-text mb-3">
          {language === 'EN' ? 'Sentiment Analysis' : 'भावना विश्लेषण'}
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto text-lg">
          {language === 'EN'
            ? 'Detect emotions and opinions in text using NLP techniques.'
            : 'NLP तकनीकों का उपयोग करके टेक्स्ट में भावनाएं और राय पहचानें।'}
        </p>
      </motion.div>

      {/* ── Concept Card ───────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-amber-700 mb-2">
          💡 {language === 'EN' ? 'What is Sentiment Analysis?' : 'भावना विश्लेषण क्या है?'}
        </h2>
        <p className="text-gray-600 leading-relaxed">
          {language === 'EN'
            ? 'Sentiment Analysis (Opinion Mining) automatically identifies whether a piece of text expresses a positive, negative, or neutral opinion. It powers product review systems, brand monitoring, and customer-feedback analysis used by millions of companies.'
            : 'भावना विश्लेषण (ओपिनियन माइनिंग) स्वतः पहचानता है कि टेक्स्ट सकारात्मक, नकारात्मक या तटस्थ राय व्यक्त करता है।'}
        </p>
      </motion.div>

      {/* ── Pipeline ───────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card">
        <StepByStepPipeline
          steps={PIPELINE_STEPS}
          title={language === 'EN' ? 'Sentiment Analysis Pipeline' : 'भावना विश्लेषण पाइपलाइन'}
        />
      </motion.div>

      {/* ── Interactive Demo ────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="card space-y-4">
        <h2 className="text-xl font-bold text-gray-800">
          🧪 {language === 'EN' ? 'Try It Yourself' : 'खुद आज़माएं'}
        </h2>
        <p className="text-sm text-gray-500">
          {language === 'EN' ? 'Type a sentence or pick a sample to detect its sentiment:' : 'एक वाक्य टाइप करें या नमूना चुनें:'}
        </p>

        {/* Sample texts */}
        <div className="flex flex-wrap gap-2">
          {SAMPLE_TEXTS.map((s, i) => (
            <button key={i} onClick={() => loadSample(s)}
              className="text-xs px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full hover:bg-amber-200 transition-colors">
              Sample {i + 1}
            </button>
          ))}
        </div>

        {/* Input row */}
        <div className="flex gap-3 flex-col sm:flex-row">
          <input
            value={inputText}
            onChange={e => { setInputText(e.target.value); setResult(null); }}
            onKeyDown={e => e.key === 'Enter' && analyze()}
            placeholder={language === 'EN' ? 'Type a sentence here…' : 'यहाँ एक वाक्य टाइप करें…'}
            className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-amber-400 focus:outline-none transition-colors"
          />
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => analyze()}
            disabled={!inputText.trim()}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all whitespace-nowrap">
            {language === 'EN' ? '🔍 Analyze' : '🔍 विश्लेषण'}
          </motion.button>
        </div>

        {/* Result */}
        <AnimatePresence>
          {result && cfg && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`rounded-2xl border-2 p-5 ${cfg.bg} ${cfg.border} space-y-4`}>

              {/* Badge + score */}
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-5xl">{cfg.emoji}</span>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    {language === 'EN' ? 'Overall Sentiment' : 'कुल भावना'}
                  </p>
                  <p className={`text-2xl font-black ${cfg.color}`}>
                    {language === 'EN' ? cfg.label : cfg.labelHI}
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xs text-gray-500">{language === 'EN' ? 'Score' : 'अंक'}</p>
                  <p className={`text-3xl font-black ${cfg.color}`}>
                    {result.score > 0 ? '+' : ''}{result.score}
                  </p>
                </div>
              </div>

              {/* Meter */}
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>😠 Negative</span>
                  <span>😐 Neutral</span>
                  <span>😊 Positive</span>
                </div>
                <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-300 via-gray-300 to-emerald-300" />
                  <motion.div
                    initial={{ left: '50%' }}
                    animate={{ left: `${scoreBarPct}%` }}
                    transition={{ type: 'spring', stiffness: 100 }}
                    className="absolute -translate-x-1/2 top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-gray-500 rounded-full shadow"
                  />
                </div>
              </div>

              {/* Detected words */}
              {result.matchedWords.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">
                    🔍 {language === 'EN' ? 'Detected sentiment words:' : 'पहचाने गए भावना शब्द:'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.matchedWords.map((m, i) => (
                      <span key={i}
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${WORD_TAG_COLORS[m.type] || 'bg-gray-100 text-gray-600'}`}>
                        {m.word}
                        <span className="ml-1 text-xs opacity-60">
                          ({m.type === 'positive' ? '+' : m.type === 'negative' ? '−' : '±flip'})
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Token breakdown */}
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">
                  🔤 {language === 'EN' ? 'Token breakdown:' : 'टोकन विवरण:'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.tokens.map((token, i) => {
                    const match = result.matchedWords.find(m => m.word === token);
                    return (
                      <span key={i}
                        className={`px-2.5 py-1 rounded-lg text-sm font-mono ${match ? WORD_TAG_COLORS[match.type] : 'bg-gray-100 text-gray-600'}`}>
                        {token}
                      </span>
                    );
                  })}
                </div>
              </div>

              {result.matchedWords.length === 0 && (
                <p className="text-sm text-gray-500 italic">
                  {language === 'EN'
                    ? 'No strong sentiment words detected — the text appears neutral.'
                    : 'कोई मजबूत भावना शब्द नहीं मिला — टेक्स्ट तटस्थ लगता है।'}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <Link to="/module/3" className="btn-secondary">← Module 3</Link>
        <Link to="/progress" className="text-sm text-gray-400 hover:text-primary-500 transition-colors">
          📊 {language === 'EN' ? 'View Progress' : 'प्रगति देखें'}
        </Link>
        <Link to="/module/5" className="btn-primary">Module 5 →</Link>
      </div>

    </div>
  );
}
