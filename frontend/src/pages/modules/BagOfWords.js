import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../App';
import { wordTokenize } from '../../utils/nlpHelpers';

/* ── helpers ── */
function buildVocab(docs) {
  const set = new Set();
  docs.forEach(d => wordTokenize(d).forEach(w => set.add(w)));
  return [...set].sort();
}
function bowVector(doc, vocab) {
  const counts = {};
  wordTokenize(doc).forEach(w => { counts[w] = (counts[w] || 0) + 1; });
  return vocab.map(w => counts[w] || 0);
}
function computeTFIDF(docs, vocab) {
  const N = docs.length;
  return docs.map(doc => {
    const tokens = wordTokenize(doc);
    const len = tokens.length || 1;
    return vocab.map(w => {
      const tf = tokens.filter(t => t === w).length / len;
      const df = docs.filter(d => wordTokenize(d).includes(w)).length;
      const idf = Math.log((N + 1) / (df + 1)) + 1;
      return parseFloat((tf * idf).toFixed(3));
    });
  });
}

const DEFAULT_DOCS = ['I love machine learning', 'Natural language processing is amazing'];

export default function BagOfWords() {
  const { language } = useLanguage();
  const [docs, setDocs] = useState(DEFAULT_DOCS);
  const [showTFIDF, setShowTFIDF] = useState(false);
  const [generated, setGenerated] = useState(false);

  const vocab = buildVocab(docs);
  const bowMatrix = docs.map(d => bowVector(d, vocab));
  const tfidfMatrix = computeTFIDF(docs, vocab);
  const matrix = showTFIDF ? tfidfMatrix : bowMatrix;
  const maxVal = Math.max(...matrix.flat(), 1);

  const updateDoc = useCallback((i, val) => {
    setDocs(prev => { const n = [...prev]; n[i] = val; return n; });
    setGenerated(false);
  }, []);

  const addDoc = () => { setDocs(prev => [...prev, '']); setGenerated(false); };
  const removeDoc = i => { setDocs(prev => prev.filter((_, idx) => idx !== i)); setGenerated(false); };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl text-4xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg mb-4">🎒</div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Module 3</p>
        <h1 className="text-4xl font-black gradient-text mb-3">
          {language === 'EN' ? 'Bag of Words & TF-IDF' : 'शब्दों का थैला और TF-IDF'}
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          {language === 'EN'
            ? 'A Bag of Words counts how many times each word appears, ignoring order. TF-IDF adds importance weights.'
            : 'बैग ऑफ वर्ड्स गिनता है कि प्रत्येक शब्द कितनी बार आता है, क्रम को नजरअंदाज करके।'}
        </p>
      </motion.div>

      {/* Concept Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-emerald-700 mb-3">
          {language === 'EN' ? '💡 Simple Analogy' : '💡 सरल उदाहरण'}
        </h2>
        <p className="text-gray-600">
          {language === 'EN'
            ? 'Imagine you put all the words from a sentence into a bag. You shake it up (order is lost) and then count how many of each word is in there. That count list is the "Bag of Words" vector!'
            : 'कल्पना करें कि आप एक वाक्य के सभी शब्दों को एक थैले में डालते हैं। क्रम खो जाता है, और फिर आप गिनते हैं कि प्रत्येक शब्द कितनी बार है।'}
        </p>
      </motion.div>

      {/* Document Inputs */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-800">
          {language === 'EN' ? '📄 Enter Documents' : '📄 दस्तावेज़ दर्ज करें'}
        </h2>
        {docs.map((doc, i) => (
          <div key={i} className="flex gap-2 items-center">
            <span className="text-sm font-bold text-gray-400 w-6">D{i + 1}</span>
            <input
              value={doc}
              onChange={e => updateDoc(i, e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder={`Document ${i + 1}`}
            />
            {docs.length > 1 && (
              <button onClick={() => removeDoc(i)} className="text-red-400 hover:text-red-600 text-lg">✕</button>
            )}
          </div>
        ))}
        <div className="flex gap-3 flex-wrap">
          {docs.length < 4 && (
            <button onClick={addDoc} className="text-sm px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-colors">
              + {language === 'EN' ? 'Add Document' : 'दस्तावेज़ जोड़ें'}
            </button>
          )}
          <button onClick={() => setGenerated(true)}
            className="text-sm px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:opacity-90 transition-opacity font-semibold">
            {language === 'EN' ? '⚡ Generate Matrix' : '⚡ मैट्रिक्स बनाएं'}
          </button>
          <button onClick={() => setShowTFIDF(v => !v)}
            className={`text-sm px-4 py-2 rounded-xl transition-colors font-semibold ${showTFIDF ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {showTFIDF ? 'TF-IDF ✓' : language === 'EN' ? 'Switch to TF-IDF' : 'TF-IDF पर जाएं'}
          </button>
        </div>
      </motion.div>

      {/* Vocabulary */}
      <AnimatePresence>
        {generated && vocab.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-700 mb-3">
              📚 {language === 'EN' ? 'Vocabulary' : 'शब्दावली'} ({vocab.length} {language === 'EN' ? 'words' : 'शब्द'})
            </h3>
            <div className="flex flex-wrap gap-2">
              {vocab.map((w, i) => (
                <motion.span key={w} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                  {w}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Matrix */}
      <AnimatePresence>
        {generated && vocab.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-x-auto">
            <h3 className="text-lg font-bold text-gray-700 mb-4">
              🧮 {showTFIDF ? 'TF-IDF' : language === 'EN' ? 'Bag of Words'  : 'बैग ऑफ वर्ड्स'} {language === 'EN' ? 'Matrix' : 'मैट्रिक्स'}
            </h3>
            <table className="min-w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-gray-500 font-semibold"></th>
                  {vocab.map(w => (
                    <th key={w} className="px-3 py-2 text-center text-gray-600 font-semibold">{w}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {docs.map((doc, di) => (
                  <tr key={di}>
                    <td className="px-3 py-2 font-bold text-gray-500 whitespace-nowrap">D{di + 1}</td>
                    {matrix[di].map((val, wi) => {
                      const intensity = val / maxVal;
                      return (
                        <motion.td key={wi}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: di * 0.1 + wi * 0.04 }}
                          className="px-3 py-2 text-center font-mono rounded"
                          style={{
                            backgroundColor: val > 0
                              ? `rgba(16,185,129,${0.15 + intensity * 0.7})`
                              : '#f9fafb',
                            color: intensity > 0.5 ? '#065f46' : '#374151',
                          }}>
                          {val}
                        </motion.td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-400 mt-3">
              {language === 'EN' ? 'Darker = higher value. Each cell shows the ' : 'गहरा = अधिक मान। '}
              {showTFIDF ? 'TF-IDF score.' : (language === 'EN' ? 'word count.' : 'शब्द गणना।')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <Link to="/module/2" className="btn-secondary">← Module 2</Link>
        <Link to="/progress" className="text-sm text-gray-400 hover:text-primary-500 transition-colors">
          📊 {language === 'EN' ? 'View Progress' : 'प्रगति देखें'}
        </Link>
        <Link to="/module/4" className="btn-primary">Module 4 →</Link>
      </div>
    </div>
  );
}
