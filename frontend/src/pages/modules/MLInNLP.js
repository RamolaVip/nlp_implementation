import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../App';
import StepByStepPipeline from '../../components/StepByStepPipeline';
import { wordTokenize } from '../../utils/nlpHelpers';

/* ── Naive Bayes (Bernoulli model) ─────────────────────────────────────── */

const TRAINING_DATA = [
  { text: 'win a free prize click here now', label: 'spam' },
  { text: 'congratulations you have won a lottery claim your cash', label: 'spam' },
  { text: 'click here to claim your free gift limited offer', label: 'spam' },
  { text: 'buy cheap discount pills online free delivery', label: 'spam' },
  { text: 'you are selected winner cash prize urgent reply', label: 'spam' },
  { text: 'earn money fast work from home free register', label: 'spam' },
  { text: 'exclusive deal for you only today free trial', label: 'spam' },
  { text: 'hello how are you doing today', label: 'ham' },
  { text: 'meeting scheduled for tomorrow morning please confirm', label: 'ham' },
  { text: 'please review the attached document and give feedback', label: 'ham' },
  { text: 'looking forward to seeing you next week', label: 'ham' },
  { text: 'can we discuss the project requirements in detail', label: 'ham' },
  { text: 'the team lunch is on friday at noon', label: 'ham' },
  { text: 'reminder your subscription renewal is due next month', label: 'ham' },
];

function trainNaiveBayes(data) {
  const classCounts = {};
  const wordCounts = {};
  const vocabulary = new Set();

  data.forEach(({ text, label }) => {
    const tokens = wordTokenize(text);
    tokens.forEach(t => vocabulary.add(t));
    classCounts[label] = (classCounts[label] || 0) + 1;
    if (!wordCounts[label]) wordCounts[label] = {};
    tokens.forEach(token => {
      wordCounts[label][token] = (wordCounts[label][token] || 0) + 1;
    });
  });

  return { classCounts, wordCounts, vocabulary: [...vocabulary], totalDocs: data.length };
}

function classify(model, text) {
  const { classCounts, wordCounts, vocabulary, totalDocs } = model;
  const tokens = wordTokenize(text);
  const vocabSize = vocabulary.length;
  const scores = {};

  Object.keys(classCounts).forEach(label => {
    const prior = Math.log(classCounts[label] / totalDocs);
    const classTotal = Object.values(wordCounts[label]).reduce((a, b) => a + b, 0);
    let logLikelihood = 0;
    tokens.forEach(token => {
      const count = (wordCounts[label][token] || 0) + 1; // Laplace smoothing
      logLikelihood += Math.log(count / (classTotal + vocabSize));
    });
    scores[label] = prior + logLikelihood;
  });

  const labels = Object.keys(scores);
  const maxScore = Math.max(...Object.values(scores));
  let sum = 0;
  const expScores = {};
  labels.forEach(l => { expScores[l] = Math.exp(scores[l] - maxScore); sum += expScores[l]; });

  const probabilities = {};
  labels.forEach(l => { probabilities[l] = Math.round((expScores[l] / sum) * 100); });
  const predicted = labels.reduce((a, b) => scores[a] > scores[b] ? a : b);
  return { predicted, probabilities };
}

/* ── Pipeline ──────────────────────────────────────────────────────────── */

const PIPELINE_STEPS = [
  {
    icon: '📦', label: 'Collect Data', color: 'bg-orange-100',
    description: 'Gather labelled training examples: documents already tagged with their correct class (e.g., spam / ham).',
    example: '"win a free prize" → spam  |  "meeting at noon" → ham',
  },
  {
    icon: '🔢', label: 'Extract Features', color: 'bg-blue-100',
    description: 'Tokenize each document and build a vocabulary. Represent each document as a bag of words (word counts or presence flags).',
    example: 'Vocab: {win, free, prize, meeting, …}  |  Doc features: {win:1, free:1, prize:1, …}',
  },
  {
    icon: '🧑‍🏫', label: 'Train Model', color: 'bg-purple-100',
    description: 'Estimate class prior probabilities and word likelihoods. Apply Laplace smoothing to handle unseen words.',
    example: 'P(spam) = 7/14 = 0.5  |  P("free"|spam) = (3+1)/(totalSpamWords + vocabSize)',
  },
  {
    icon: '📊', label: 'Evaluate', color: 'bg-emerald-100',
    description: 'Test the trained model on held-out examples. Measure accuracy, precision, recall, and F1 score.',
    example: 'Accuracy: 92%  |  Precision: 0.90  |  Recall: 0.94',
  },
  {
    icon: '🔮', label: 'Predict', color: 'bg-red-100',
    description: 'For a new document, compute the posterior probability for each class and pick the highest. Output the predicted label and confidence.',
    example: '"click free offer" → P(spam|doc) = 87%  →  Label: 📧 SPAM',
  },
];

const SAMPLE_TEXTS = [
  { text: 'Win a free prize click here now', expected: 'spam' },
  { text: 'Meeting is scheduled for Monday morning', expected: 'ham' },
  { text: 'Congratulations you have won a cash lottery', expected: 'spam' },
  { text: 'Can you please review the attached report', expected: 'ham' },
  { text: 'Exclusive free offer only today limited discount', expected: 'spam' },
];

/* ── Component ─────────────────────────────────────────────────────────── */

export default function MLInNLP() {
  const { language } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(null);

  const model = useMemo(() => trainNaiveBayes(TRAINING_DATA), []);

  function predict(text) {
    const t = (text ?? inputText).trim();
    if (!t) return;
    const r = classify(model, t);
    setResult({ ...r, text: t });
  }

  function loadSample(text) {
    setInputText(text);
    predict(text);
  }

  const isSpam = result?.predicted === 'spam';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl text-4xl bg-gradient-to-br from-orange-400 to-red-500 shadow-lg mb-4">📈</div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Module 7</p>
        <h1 className="text-4xl font-black gradient-text mb-3">
          {language === 'EN' ? 'ML in NLP' : 'NLP में ML'}
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto text-lg">
          {language === 'EN'
            ? 'Naive Bayes, SVM and neural approaches for text classification.'
            : 'टेक्स्ट वर्गीकरण के लिए Naive Bayes, SVM और न्यूरल दृष्टिकोण।'}
        </p>
      </motion.div>

      {/* ── Concept Card ───────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-orange-700 mb-2">
          💡 {language === 'EN' ? 'ML for Text Classification' : 'टेक्स्ट वर्गीकरण के लिए ML'}
        </h2>
        <p className="text-gray-600 leading-relaxed">
          {language === 'EN'
            ? 'Machine Learning text classifiers learn word-class associations from labelled examples. Naive Bayes is one of the simplest and most effective: it computes the probability that a document belongs to each class using Bayes\' theorem, assuming word independence.'
            : 'ML टेक्स्ट क्लासिफायर लेबल किए गए उदाहरणों से शब्द-वर्ग संबंध सीखते हैं।'}
        </p>
      </motion.div>

      {/* ── Pipeline ───────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card">
        <StepByStepPipeline
          steps={PIPELINE_STEPS}
          title={language === 'EN' ? 'ML Classification Pipeline' : 'ML वर्गीकरण पाइपलाइन'}
        />
      </motion.div>

      {/* ── Classifier Demo ─────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="card space-y-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            🧪 {language === 'EN' ? 'Naive Bayes Spam Classifier' : 'Naive Bayes स्पैम क्लासिफायर'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {language === 'EN'
              ? `Trained on ${TRAINING_DATA.length} examples (${TRAINING_DATA.filter(d => d.label === 'spam').length} spam / ${TRAINING_DATA.filter(d => d.label === 'ham').length} ham). Type a message to classify it:`
              : `${TRAINING_DATA.length} उदाहरणों पर प्रशिक्षित। एक संदेश टाइप करें:`}
          </p>
        </div>

        {/* Training data preview */}
        <details className="rounded-xl bg-gray-50 border border-gray-100">
          <summary className="px-4 py-2.5 text-sm font-semibold text-gray-600 cursor-pointer select-none">
            📚 {language === 'EN' ? 'View Training Data' : 'ट्रेनिंग डेटा देखें'}
          </summary>
          <div className="px-4 pb-4 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TRAINING_DATA.map((d, i) => (
              <div key={i} className={`text-xs rounded-lg px-3 py-1.5 ${d.label === 'spam' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                <span className="font-semibold mr-1">[{d.label}]</span>{d.text}
              </div>
            ))}
          </div>
        </details>

        {/* Sample texts */}
        <div className="flex flex-wrap gap-2">
          {SAMPLE_TEXTS.map((s, i) => (
            <button key={i} onClick={() => loadSample(s.text)}
              className={`text-xs px-3 py-1.5 rounded-full hover:opacity-80 transition-colors ${
                s.expected === 'spam' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              }`}>
              {s.expected === 'spam' ? '📧' : '✉️'} Sample {i + 1}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-3 flex-col sm:flex-row">
          <input
            value={inputText}
            onChange={e => { setInputText(e.target.value); setResult(null); }}
            onKeyDown={e => e.key === 'Enter' && predict()}
            placeholder={language === 'EN' ? 'Enter a message to classify…' : 'वर्गीकृत करने के लिए संदेश दर्ज करें…'}
            className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-orange-400 focus:outline-none transition-colors"
          />
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => predict()}
            disabled={!inputText.trim()}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all whitespace-nowrap text-sm">
            {language === 'EN' ? '🔮 Classify' : '🔮 वर्गीकृत करें'}
          </motion.button>
        </div>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`rounded-2xl border-2 p-5 space-y-4 ${isSpam ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'}`}>

              {/* Label */}
              <div className="flex items-center gap-4">
                <span className="text-5xl">{isSpam ? '📧' : '✉️'}</span>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    {language === 'EN' ? 'Prediction' : 'भविष्यवाणी'}
                  </p>
                  <p className={`text-2xl font-black ${isSpam ? 'text-red-600' : 'text-green-600'}`}>
                    {isSpam ? '📧 SPAM' : '✉️ HAM (Not Spam)'}
                  </p>
                </div>
              </div>

              {/* Probability bars */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-600">
                  {language === 'EN' ? 'Class probabilities:' : 'वर्ग संभावनाएं:'}
                </p>
                {Object.entries(result.probabilities)
                  .sort((a, b) => b[1] - a[1])
                  .map(([label, pct]) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-600 w-10">{label}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={`h-4 rounded-full ${label === 'spam' ? 'bg-red-500' : 'bg-green-500'}`}
                        />
                      </div>
                      <span className={`text-sm font-bold w-10 text-right ${label === 'spam' ? 'text-red-600' : 'text-green-600'}`}>
                        {pct}%
                      </span>
                    </div>
                  ))}
              </div>

              <p className="text-xs text-gray-400 italic">
                {language === 'EN'
                  ? 'Using Naive Bayes with Laplace smoothing. Probabilities computed via log-likelihood.'
                  : 'Laplace स्मूदिंग के साथ Naive Bayes का उपयोग।'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <Link to="/module/6" className="btn-secondary">← Module 6</Link>
        <Link to="/progress" className="text-sm text-gray-400 hover:text-primary-500 transition-colors">
          📊 {language === 'EN' ? 'View Progress' : 'प्रगति देखें'}
        </Link>
        <Link to="/module/8" className="btn-primary">Module 8 →</Link>
      </div>

    </div>
  );
}
