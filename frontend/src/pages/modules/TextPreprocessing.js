import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../../App';
import { wordTokenize, removeStopwords, simpleStem } from '../../utils/nlpHelpers';

const DEFAULT_SENTENCE = 'The quick brown fox jumps over the lazy dogs';

const STOPWORDS_SET = new Set(['a','an','the','is','it','in','on','at','to','for','of','and','or','but','not','with','this','that','these','those','i','you','he','she','we','they','be','am','are','was','were','been','have','has','had','do','does','did','will','would','could','should','over']);

export default function TextPreprocessing() {
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();

  const [sentence, setSentence] = useState(DEFAULT_SENTENCE);
  const [activeStep, setActiveStep] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const tokens = wordTokenize(sentence);
  const withoutStopwords = removeStopwords(tokens);
  const stemmed = withoutStopwords.map(w => simpleStem(w));

  async function runAnimation() {
    setIsAnimating(true);
    setActiveStep(0);
    await new Promise(r => setTimeout(r, 1200));
    setActiveStep(1);
    await new Promise(r => setTimeout(r, 1400));
    setActiveStep(2);
    await new Promise(r => setTimeout(r, 1400));
    setIsAnimating(false);
  }

  const isStopword = w => STOPWORDS_SET.has(w.toLowerCase());

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 px-4 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block bg-white bg-opacity-20 rounded-full px-4 py-1 text-sm font-semibold mb-4">Module 2</span>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3">Text Preprocessing</h1>
            <p className="text-emerald-100 text-lg max-w-xl mx-auto">Clean and prepare raw text before feeding it to an NLP model</p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
        {/* Input */}
        <section className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Sentence</h2>
          <div className="flex gap-3 mb-2 flex-col sm:flex-row">
            <input
              type="text"
              value={sentence}
              onChange={e => { setSentence(e.target.value); setActiveStep(null); }}
              className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:border-emerald-400 focus:outline-none"
              placeholder="Enter a sentence to preprocess..."
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={runAnimation}
              disabled={isAnimating || !sentence.trim()}
              className="bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              {isAnimating ? 'Processing...' : '▶ Run Pipeline'}
            </motion.button>
          </div>
          <p className="text-sm text-gray-400">Click "Run Pipeline" to see each step animated</p>
        </section>

        {/* Step 1: Tokenization */}
        <motion.section
          className={`bg-white rounded-3xl shadow-sm p-8 border-2 transition-colors ${activeStep === 0 ? 'border-blue-400' : 'border-gray-100'}`}
          animate={activeStep === 0 ? { scale: 1.01 } : { scale: 1 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center font-bold">1</span>
            <h2 className="text-2xl font-bold text-gray-800">Tokenization</h2>
            <span className="ml-auto text-sm text-gray-400">{tokens.length} tokens</span>
          </div>
          <p className="text-gray-500 mb-5 text-sm">Split the sentence into individual words (tokens)</p>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {tokens.map((token, i) => (
                <motion.span
                  key={`tok-${i}`}
                  initial={{ opacity: 0, scale: 0.5, y: 10 }}
                  animate={activeStep !== null ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0.4, scale: 0.95 }}
                  transition={{ type: 'spring', delay: i * 0.07, stiffness: 300, damping: 20 }}
                  className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg font-mono text-sm font-semibold"
                >
                  {token}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* Step 2: Stopword Removal */}
        <motion.section
          className={`bg-white rounded-3xl shadow-sm p-8 border-2 transition-colors ${activeStep === 1 ? 'border-red-400' : 'border-gray-100'}`}
          animate={activeStep === 1 ? { scale: 1.01 } : { scale: 1 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-red-100 text-red-700 w-8 h-8 rounded-full flex items-center justify-center font-bold">2</span>
            <h2 className="text-2xl font-bold text-gray-800">Stopword Removal</h2>
            <span className="ml-auto text-sm text-gray-400">{withoutStopwords.length} remain</span>
          </div>
          <p className="text-gray-500 mb-5 text-sm">
            <span className="inline-block w-3 h-3 rounded bg-red-300 mr-1 align-middle" />stopwords fade out &nbsp;
            <span className="inline-block w-3 h-3 rounded bg-green-300 mr-1 align-middle" />meaningful words stay
          </p>
          <div className="flex flex-wrap gap-2">
            {tokens.map((token, i) => {
              const stop = isStopword(token);
              return (
                <motion.span
                  key={`sw-${i}`}
                  animate={activeStep >= 1 ? {
                    opacity: stop ? 0.25 : 1,
                    scale: stop ? 0.85 : 1,
                  } : { opacity: 0.4, scale: 0.95 }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                  className={`px-3 py-1.5 rounded-lg font-mono text-sm font-semibold transition-colors
                    ${activeStep >= 1
                      ? stop ? 'bg-red-100 text-red-400 line-through' : 'bg-emerald-100 text-emerald-800'
                      : 'bg-gray-100 text-gray-600'
                    }`}
                >
                  {token}
                </motion.span>
              );
            })}
          </div>
        </motion.section>

        {/* Step 3: Stemming */}
        <motion.section
          className={`bg-white rounded-3xl shadow-sm p-8 border-2 transition-colors ${activeStep === 2 ? 'border-purple-400' : 'border-gray-100'}`}
          animate={activeStep === 2 ? { scale: 1.01 } : { scale: 1 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-purple-100 text-purple-700 w-8 h-8 rounded-full flex items-center justify-center font-bold">3</span>
            <h2 className="text-2xl font-bold text-gray-800">Stemming</h2>
          </div>
          <p className="text-gray-500 mb-5 text-sm">Reduce each word to its root/base form</p>
          <div className="flex flex-wrap gap-3">
            {withoutStopwords.map((token, i) => {
              const stem = simpleStem(token);
              const changed = stem !== token;
              return (
                <motion.div
                  key={`stem-${i}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={activeStep >= 2 ? { opacity: 1, y: 0 } : { opacity: 0.4 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center"
                >
                  {changed && activeStep >= 2 ? (
                    <>
                      <span className="text-xs text-gray-400 line-through font-mono">{token}</span>
                      <span className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-lg font-mono text-sm font-bold">{stem}</span>
                    </>
                  ) : (
                    <span className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg font-mono text-sm font-semibold">{stem}</span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Stats */}
        {activeStep !== null && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100"
          >
            <h3 className="font-bold text-gray-800 mb-4 text-lg">📊 Statistics</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Original Tokens', value: tokens.length, color: 'text-blue-600 bg-blue-50' },
                { label: 'After Stopword Removal', value: withoutStopwords.length, color: 'text-emerald-600 bg-emerald-50' },
                { label: 'After Stemming', value: stemmed.length, color: 'text-purple-600 bg-purple-50' },
              ].map((s, i) => (
                <div key={i} className={`rounded-2xl p-4 text-center ${s.color}`}>
                  <div className="text-3xl font-extrabold">{s.value}</div>
                  <div className="text-xs font-medium mt-1 opacity-80">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <button onClick={() => navigate('/modules/intro-nlp')} className="px-5 py-3 rounded-xl bg-gray-100 text-gray-600 font-semibold hover:bg-gray-200 transition-colors">← Previous Module</button>
          <button onClick={() => navigate('/modules/bag-of-words')} className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors">Next Module →</button>
        </div>
      </div>
    </div>
  );
}
