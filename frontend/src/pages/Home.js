import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../App';

/* ─── Module metadata ───────────────────────────────────────────────────── */

const MODULES = [
  {
    id: 1,
    icon: '🧠',
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    titleEN: 'Intro to NLP',
    titleHI: 'NLP परिचय',
    descEN: 'What is Natural Language Processing? Explore how computers understand human language.',
    descHI: 'प्राकृतिक भाषा प्रसंस्करण क्या है? जानें कैसे कंप्यूटर मानव भाषा समझते हैं।',
    topics: ['Tokenization', 'Parsing', 'NLP Pipeline'],
  },
  {
    id: 2,
    icon: '🔧',
    color: 'from-blue-500 to-cyan-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    titleEN: 'Text Preprocessing',
    titleHI: 'टेक्स्ट प्रीप्रोसेसिंग',
    descEN: 'Clean and prepare raw text: stop words, stemming, lemmatization.',
    descHI: 'कच्चे टेक्स्ट को साफ करें: स्टॉप वर्ड्स, स्टेमिंग, लेमेटाइज़ेशन।',
    topics: ['Stopwords', 'Stemming', 'Lemmatization'],
  },
  {
    id: 3,
    icon: '🎒',
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    titleEN: 'Bag of Words',
    titleHI: 'बैग ऑफ वर्ड्स',
    descEN: 'Represent text as word frequency vectors. Build your first document matrix.',
    descHI: 'टेक्स्ट को शब्द-आवृत्ति वेक्टर के रूप में दर्शाएं।',
    topics: ['TF-IDF', 'Vocabulary', 'Vectors'],
  },
  {
    id: 4,
    icon: '😊',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    titleEN: 'Sentiment Analysis',
    titleHI: 'भावना विश्लेषण',
    descEN: 'Detect positive, negative, and neutral emotions in text using ML.',
    descHI: 'ML का उपयोग करके टेक्स्ट में सकारात्मक, नकारात्मक भावनाएं पहचानें।',
    topics: ['Polarity', 'Opinion Mining', 'Lexicons'],
  },
  {
    id: 5,
    icon: '🔗',
    color: 'from-pink-500 to-rose-500',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    titleEN: 'N-grams',
    titleHI: 'एन-ग्राम',
    descEN: 'Model word sequences with bigrams and trigrams for language prediction.',
    descHI: 'भाषा भविष्यवाणी के लिए बाइग्राम और ट्राइग्राम के साथ शब्द अनुक्रमों को मॉडल करें।',
    topics: ['Bigrams', 'Trigrams', 'Language Models'],
  },
  {
    id: 6,
    icon: '🤖',
    color: 'from-cyan-500 to-blue-600',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    titleEN: 'Chatbot Simulator',
    titleHI: 'चैटबॉट सिम्युलेटर',
    descEN: 'Build and interact with a rule-based and ML-powered chatbot.',
    descHI: 'नियम-आधारित और ML-संचालित चैटबॉट बनाएं और उससे बात करें।',
    topics: ['Intent Detection', 'Regex Rules', 'Dialogue'],
  },
  {
    id: 7,
    icon: '📈',
    color: 'from-orange-500 to-red-500',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    titleEN: 'ML in NLP',
    titleHI: 'NLP में ML',
    descEN: 'Naive Bayes, SVM, and neural approaches for text classification.',
    descHI: 'टेक्स्ट वर्गीकरण के लिए नाइव बेयज़, SVM और न्यूरल दृष्टिकोण।',
    topics: ['Naive Bayes', 'Word2Vec', 'Transformers'],
  },
  {
    id: 8,
    icon: '⚖️',
    color: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    titleEN: 'AI Ethics',
    titleHI: 'AI नैतिकता',
    descEN: 'Bias, fairness, and responsible AI. The social impact of language models.',
    descHI: 'पक्षपात, निष्पक्षता और जिम्मेदार AI। भाषा मॉडलों का सामाजिक प्रभाव।',
    topics: ['Bias', 'Fairness', 'Privacy'],
  },
];

const STATS = [
  { value: '50+', label: 'Animations', labelHI: 'एनिमेशन', icon: '✨' },
  { value: '8',   label: 'Interactive Demos', labelHI: 'इंटरैक्टिव डेमो', icon: '🎮' },
  { value: '40+', label: 'Quiz Questions', labelHI: 'प्रश्न', icon: '🧩' },
  { value: '100%', label: 'Free & Open', labelHI: 'मुफ़्त और ओपन', icon: '🎁' },
];

/* ─── Animated typing hook ──────────────────────────────────────────────── */

function useTyping(phrases, speed = 80, pause = 2000) {
  const [text, setText] = useState('');
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const timeout = useRef(null);

  useEffect(() => {
    const current = phrases[phraseIdx];

    if (!deleting && charIdx < current.length) {
      timeout.current = setTimeout(() => setCharIdx(c => c + 1), speed);
    } else if (!deleting && charIdx === current.length) {
      timeout.current = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIdx > 0) {
      timeout.current = setTimeout(() => setCharIdx(c => c - 1), speed / 2);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setPhraseIdx(i => (i + 1) % phrases.length);
    }

    setText(current.slice(0, charIdx));
    return () => clearTimeout(timeout.current);
  }, [charIdx, deleting, phraseIdx, phrases, speed, pause]);

  return text;
}

/* ─── Container animation variants ─────────────────────────────────────── */

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

/* ─── Component ─────────────────────────────────────────────────────────── */

export default function Home() {
  const { language } = useLanguage();

  const typingPhrases =
    language === 'EN'
      ? ['Natural Language Processing', 'Text Analysis', 'Sentiment Detection', 'Chatbot Building', 'AI & Ethics']
      : ['प्राकृतिक भाषा प्रसंस्करण', 'टेक्स्ट विश्लेषण', 'भावना पहचान', 'चैटबॉट निर्माण', 'AI और नैतिकता'];

  const typedText = useTyping(typingPhrases);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-24">

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="text-center relative">
        {/* Background blobs */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-16 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl animate-float" />
          <div className="absolute -top-12 -right-16 w-80 h-80 bg-accent-blue/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-40 left-1/2 -translate-x-1/2 w-64 h-64 bg-accent-pink/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="badge bg-primary-100 text-primary-700 text-sm mb-4 inline-flex">
            🎓 {language === 'EN' ? 'Interactive NLP Course' : 'इंटरैक्टिव NLP कोर्स'}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-black mb-4 leading-tight"
        >
          {language === 'EN' ? (
            <>Learn <span className="gradient-text">NLP</span> the Fun Way!</>
          ) : (
            <>मज़ेदार तरीके से <span className="gradient-text">NLP</span> सीखें!</>
          )}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl md:text-3xl text-gray-500 mb-8 h-10"
        >
          <span className="text-primary-500 font-semibold typing-cursor">{typedText}</span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-gray-500 max-w-2xl mx-auto mb-10"
        >
          {language === 'EN'
            ? 'Master NLP concepts through interactive demos, visual animations, and hands-on quizzes. Perfect for students and beginners!'
            : 'इंटरैक्टिव डेमो, विज़ुअल एनिमेशन और हैंड्स-ऑन क्विज़ के माध्यम से NLP अवधारणाओं में महारत हासिल करें।'
          }
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/module/1" className="btn-primary text-lg px-8 py-3">
            🚀 {language === 'EN' ? 'Start Learning' : 'सीखना शुरू करें'}
          </Link>
          <Link to="/progress" className="btn-secondary text-lg px-8 py-3">
            📊 {language === 'EN' ? 'My Progress' : 'मेरी प्रगति'}
          </Link>
        </motion.div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
        variants={containerVariants}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {STATS.map((stat, i) => (
          <motion.div
            key={i}
            variants={cardVariants}
            className="glass rounded-2xl p-6 text-center shadow-soft"
          >
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-3xl font-black gradient-text">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-1">
              {language === 'EN' ? stat.label : stat.labelHI}
            </div>
          </motion.div>
        ))}
      </motion.section>

      {/* ── Module cards ────────────────────────────────────────────────── */}
      <section>
        <div className="text-center mb-10">
          <h2 className="section-title">
            {language === 'EN' ? '8 Learning Modules' : '8 शिक्षण मॉड्यूल'}
          </h2>
          <p className="section-subtitle">
            {language === 'EN'
              ? 'Each module builds on the last — from basics to advanced AI ethics.'
              : 'प्रत्येक मॉड्यूल पिछले पर निर्भर करता है — बेसिक्स से लेकर उन्नत AI नैतिकता तक।'
            }
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {MODULES.map(mod => (
            <motion.div key={mod.id} variants={cardVariants}>
              <Link to={`/module/${mod.id}`} className="block h-full">
                <div className={`module-card h-full rounded-2xl border ${mod.border} ${mod.bg} p-5 flex flex-col`}>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center text-2xl shadow-md`}>
                      {mod.icon}
                    </div>
                    <span className="text-xs font-bold text-gray-400">
                      MODULE {mod.id}
                    </span>
                  </div>

                  {/* Title + desc */}
                  <h3 className="font-bold text-gray-800 mb-2 text-base leading-snug">
                    {language === 'EN' ? mod.titleEN : mod.titleHI}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed flex-1">
                    {language === 'EN' ? mod.descEN : mod.descHI}
                  </p>

                  {/* Topics */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {mod.topics.map(t => (
                      <span key={t} className="badge bg-white/70 text-gray-500 border border-gray-200">
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className={`mt-4 text-xs font-semibold bg-gradient-to-r ${mod.color} bg-clip-text text-transparent flex items-center gap-1`}>
                    {language === 'EN' ? 'Explore →' : 'देखें →'}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── What you'll learn ────────────────────────────────────────────── */}
      <section className="glass rounded-3xl p-8 md:p-12">
        <h2 className="section-title text-center">
          {language === 'EN' ? "What You'll Learn" : 'आप क्या सीखेंगे'}
        </h2>
        <p className="section-subtitle text-center">
          {language === 'EN'
            ? 'Real NLP skills used by engineers at top AI companies.'
            : 'शीर्ष AI कंपनियों के इंजीनियरों द्वारा उपयोग किए जाने वाले वास्तविक NLP कौशल।'
          }
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: '🔬',
              titleEN: 'Core NLP Theory',
              titleHI: 'NLP सिद्धांत',
              pointsEN: ['Tokenization & POS tagging', 'Parsing & syntax trees', 'Language modeling basics'],
              pointsHI: ['टोकनाइज़ेशन और POS टैगिंग', 'पार्सिंग और सिंटैक्स ट्री', 'भाषा मॉडलिंग की मूल बातें'],
            },
            {
              icon: '⚡',
              titleEN: 'Practical Skills',
              titleHI: 'व्यावहारिक कौशल',
              pointsEN: ['Build a text classifier', 'Create a simple chatbot', 'Visualize word vectors'],
              pointsHI: ['टेक्स्ट क्लासिफायर बनाएं', 'सरल चैटबॉट बनाएं', 'वर्ड वेक्टर विज़ुअलाइज़ करें'],
            },
            {
              icon: '🌍',
              titleEN: 'Real-World Impact',
              titleHI: 'वास्तविक दुनिया का प्रभाव',
              pointsEN: ['Bias detection in AI', 'Ethical considerations', 'Responsible AI usage'],
              pointsHI: ['AI में पूर्वाग्रह पहचान', 'नैतिक विचार', 'जिम्मेदार AI उपयोग'],
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/60 rounded-2xl p-6 border border-white/80"
            >
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-bold text-gray-800 mb-3">
                {language === 'EN' ? item.titleEN : item.titleHI}
              </h3>
              <ul className="space-y-2">
                {(language === 'EN' ? item.pointsEN : item.pointsHI).map((p, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                    {p}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="text-center pb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-primary-500 to-accent-purple rounded-3xl p-12 text-white shadow-glow-lg"
        >
          <h2 className="text-4xl font-black mb-4">
            {language === 'EN' ? 'Ready to dive in?' : 'शुरू करने के लिए तैयार हैं?'}
          </h2>
          <p className="text-primary-100 mb-8 text-lg">
            {language === 'EN'
              ? 'No coding experience needed. Just curiosity and a browser!'
              : 'कोई कोडिंग अनुभव आवश्यक नहीं। बस जिज्ञासा और एक ब्राउज़र!'
            }
          </p>
          <Link
            to="/module/1"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-primary-600 rounded-xl font-bold text-lg
              hover:bg-primary-50 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            🧠 {language === 'EN' ? "Let's Go! Module 1" : 'चलिए! मॉड्यूल 1'}
          </Link>
        </motion.div>
      </section>

    </div>
  );
}
