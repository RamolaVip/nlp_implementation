import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../../App';
import StepByStepPipeline from '../../components/StepByStepPipeline';

const TEXT = {
  en: {
    title: 'What is NLP?',
    subtitle: 'Natural Language Processing — Teaching computers to understand human language',
    heroDesc: 'NLP is the branch of Artificial Intelligence that enables computers to read, understand, and generate human language.',
    pipelineTitle: 'How NLP Works',
    examplesTitle: 'Real-Life NLP Examples',
    tryItTitle: 'Try It Yourself!',
    tryItPlaceholder: 'Type a sentence here...',
    analyzeBtn: 'Analyze Sentence',
    nextBtn: 'Next Module →',
    prevBtn: '← Back to Home',
    wordCount: 'Word Count',
    sentenceType: 'Sentence Type',
    characters: 'Characters',
  },
  hi: {
    title: 'NLP क्या है?',
    subtitle: 'प्राकृतिक भाषा प्रसंस्करण — कंप्यूटर को मानव भाषा समझाना',
    heroDesc: 'NLP कृत्रिम बुद्धिमत्ता की वह शाखा है जो कंप्यूटर को मानव भाषा पढ़ने, समझने और उत्पन्न करने में सक्षम बनाती है।',
    pipelineTitle: 'NLP कैसे काम करता है',
    examplesTitle: 'वास्तविक जीवन के NLP उदाहरण',
    tryItTitle: 'खुद आज़माएं!',
    tryItPlaceholder: 'यहाँ एक वाक्य टाइप करें...',
    analyzeBtn: 'वाक्य विश्लेषण करें',
    nextBtn: 'अगला मॉड्यूल →',
    prevBtn: '← होम पर वापस',
    wordCount: 'शब्द गणना',
    sentenceType: 'वाक्य प्रकार',
    characters: 'अक्षर',
  },
};

const PIPELINE_STEPS = [
  { icon: '✍️', label: 'Input Text', color: 'bg-blue-100', description: 'The user provides raw text — a sentence, paragraph, or document in natural human language.', example: '"The movie was absolutely fantastic!"' },
  { icon: '🔤', label: 'Break into Words', color: 'bg-purple-100', description: 'The text is split into individual words (tokens). This is called tokenization.', example: '["The", "movie", "was", "absolutely", "fantastic"]' },
  { icon: '🧹', label: 'Remove Noise', color: 'bg-yellow-100', description: 'Common words like "the", "was" are removed. Punctuation and irrelevant symbols are cleaned.', example: '["movie", "absolutely", "fantastic"]' },
  { icon: '🧠', label: 'Analyze Meaning', color: 'bg-emerald-100', description: 'The computer identifies sentiment, entities, grammar structure, and meaning from the remaining words.', example: 'Sentiment: Positive 😄 | Topic: Entertainment' },
  { icon: '💡', label: 'Generate Output', color: 'bg-orange-100', description: 'The system produces a response, translation, summary, or classification based on understanding.', example: 'Response: "Great! This seems like a positive review."' },
];

const EXAMPLES = [
  { icon: '🤖', title: 'Chatbots', desc: 'Virtual assistants like Alexa and Siri use NLP to understand your voice commands.', color: 'from-blue-400 to-blue-600' },
  { icon: '🌐', title: 'Translation', desc: 'Google Translate uses NLP to convert text between 100+ languages instantly.', color: 'from-emerald-400 to-emerald-600' },
  { icon: '🔍', title: 'Search Engines', desc: 'Google understands your search query meaning, not just keywords, using NLP.', color: 'from-purple-400 to-purple-600' },
  { icon: '📧', title: 'Spam Filter', desc: 'Email spam filters use NLP to detect unwanted emails automatically.', color: 'from-red-400 to-red-600' },
  { icon: '📰', title: 'Auto-Summary', desc: 'News apps summarize long articles into short snippets using NLP.', color: 'from-yellow-400 to-yellow-600' },
  { icon: '😊', title: 'Sentiment Analysis', desc: 'Companies analyze customer reviews to find out if feedback is positive or negative.', color: 'from-pink-400 to-pink-600' },
];

export default function IntroNLP() {
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();
  const t = TEXT[language] || TEXT.en;

  const [inputSentence, setInputSentence] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [animatePipeline, setAnimatePipeline] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatePipeline(true), 500);
    return () => clearTimeout(timer);
  }, []);

  function analyzeSentence() {
    if (!inputSentence.trim()) return;
    const text = inputSentence.trim();
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const lastChar = text[text.length - 1];
    let type = 'Statement 📝';
    if (lastChar === '?') type = 'Question ❓';
    else if (lastChar === '!') type = 'Exclamation ❗';
    setAnalysis({ wordCount: words.length, characters: text.length, type });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-90" />
        <div className="relative max-w-4xl mx-auto text-center text-white">
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block bg-white bg-opacity-20 rounded-full px-4 py-1 text-sm font-semibold mb-4 backdrop-blur-sm">Module 1</span>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4">{t.title}</h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-6">{t.subtitle}</p>
            <p className="text-base md:text-lg text-blue-200 max-w-2xl mx-auto">{t.heroDesc}</p>
          </motion.div>
          {/* Animated pipeline preview */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-2 mt-10 flex-wrap"
          >
            {['Human Language 🗣️', '→', 'Computer Processing 💻', '→', 'Understanding 🧠'].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={animatePipeline ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.6 + i * 0.2 }}
                className={item === '→' ? 'text-blue-200 text-2xl font-bold' : 'bg-white bg-opacity-20 backdrop-blur-sm rounded-xl px-4 py-2 font-semibold text-sm'}
              >
                {item}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-16">
        {/* Real-life examples */}
        <section>
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">{t.examplesTitle}</h2>
          <p className="text-center text-gray-500 mb-8">NLP powers tools you use every day</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {EXAMPLES.map((ex, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className={`bg-gradient-to-br ${ex.color} rounded-2xl p-5 text-white shadow-md cursor-default`}
              >
                <div className="text-4xl mb-2">{ex.icon}</div>
                <h3 className="font-bold text-lg mb-1">{ex.title}</h3>
                <p className="text-sm text-white text-opacity-90 leading-snug">{ex.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Step-by-step pipeline */}
        <section className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">{t.pipelineTitle}</h2>
          <StepByStepPipeline steps={PIPELINE_STEPS} title="NLP Pipeline" />
        </section>

        {/* Try It Demo */}
        <section className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{t.tryItTitle}</h2>
          <p className="text-gray-500 mb-6">Type a sentence and see how a computer understands it.</p>
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={inputSentence}
              onChange={e => setInputSentence(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && analyzeSentence()}
              placeholder={t.tryItPlaceholder}
              className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:border-blue-400 focus:outline-none transition-colors"
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={analyzeSentence}
              className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              {t.analyzeBtn}
            </motion.button>
          </div>
          <AnimatePresence>
            {analysis && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-3 gap-4"
              >
                {[
                  { label: t.wordCount, value: analysis.wordCount, color: 'bg-blue-50 text-blue-700 border-blue-200' },
                  { label: t.characters, value: analysis.characters, color: 'bg-purple-50 text-purple-700 border-purple-200' },
                  { label: t.sentenceType, value: analysis.type, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`rounded-2xl border-2 p-4 text-center ${stat.color}`}
                  >
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <div className="text-sm font-medium mt-1 opacity-80">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gray-100 text-gray-600 font-semibold hover:bg-gray-200 transition-colors">
            {t.prevBtn}
          </button>
          <button onClick={() => navigate('/modules/text-preprocessing')} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors">
            {t.nextBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
